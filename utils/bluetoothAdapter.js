var lang = require('./languageUtils');

const DEVICENAME = ['MCB', 'HC08']
const ADAPTERTIME = 5000


function bluetoothAdapter(namekey = DEVICENAME) {
  this.namekey = namekey;
  this.callback_blelistchange = null; //回调函数
  this.devicelist = [], //备选BLE设备列表
    this._lang = lang._lang();

  this.ble_state = { //ble连接状态
    adapter_state: false, //手机蓝牙适配器打开状态
    discovery_state: false, //ble设备搜索状态
  }

  // 打开蓝牙适配器 搜索蓝牙设备
  this.open_BLEAdapter = function (param) {
    let that = this;
    this._lang = lang._lang();

    //打开蓝牙适配器
    wx.openBluetoothAdapter({
      success: (res) => {
        // console.log(res);
        that.ble_state.adapter_state = true;
        if (param.hasOwnProperty('success')) {
          param.success(this._lang['蓝牙已打开'])
        }
      },
      fail: (res) => {
        that.ble_state.adapter_state = false;
        if (param.hasOwnProperty('fail')) {
          param.fail(this._lang['蓝牙未打开'] + "错误码：" + res.errCode)
        }
        if (res.errCode === 10001) {
          //开启蓝牙适配器状态监听
          wx.onBluetoothAdapterStateChange((res) => {
            //console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.open_BLEAdapter();
            }
          })
        }
      }
    });
  };

  /*
   *开始搜索ble设备
   */
  this.startfind_BLEDevice = function () {
    let that = this;
    if (that.ble_state.adapter_state) {
      that.__getBLEListbyname();
    }
  };

  // 停止搜索BLE设备
  this.stopfind_BLEDevice = () => {
    let that = this;
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        that.ble_state.discovery_state = false;
        //console.log('stopBluetoothDevicesDiscovery', res);
      },
    });
  };

  /*
   *根据名字搜寻对应的BLE设备
   */
  this.__getBLEListbyname = function () {
    let that = this;
    //开始搜索BLE蓝牙设备
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        that.ble_state.discovery_state = true;
        //开启三十秒钟的蓝牙设备搜索，之后关闭设备搜索
        setTimeout(function () {
          wx.stopBluetoothDevicesDiscovery({
            success: function (res) {
              that.ble_state.discovery_state = false;
            },
          });
        }, ADAPTERTIME)
      },
      fail: (res) => {
        that.ble_state.discovery_state = false;
      }
    });
    //搜索success 绑定onfound事件
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        that.__appendblelist(device);
        //调用回调函数 发送新蓝牙设备列表
        if (that.devicelist.length && typeof that.callback_blelistchange === 'function') {
          that.callback_blelistchange(that.devicelist);
        }
      });
    });
  };

  /**
   * 添加BLE设备列表（this.devicelist）
   */
  this.__appendblelist = function (deviceinfo) {
    let that = this;
    let date = new Date();
    let info;
    if (!deviceinfo.name && !deviceinfo.localName) {
      return;
    }
    //找到符合命名规则的ble设备
    let advertisDataView = new Uint8Array(deviceinfo.advertisData);
    if ((advertisDataView[0] == 77 && advertisDataView[1] == 67) && (advertisDataView[2] == 66 || advertisDataView[2] == 67 || advertisDataView[2] == 68 || advertisDataView[2] == 69)) {
      info = this.__getRadarInfo(deviceinfo.advertisData);
      //遍历寻找 如果已在列表中不添加 否则添加进列表
      for (let d of that.devicelist) {
        if (d.deviceid == deviceinfo.deviceId) {
          d.ftime = date.getTime();
          d.mAcurrentutputFunction = info.mAcurrentutputFunction;
          d.mARealtimeValue = info.mARealtimeValue;
          d.sensorMode = info.sensorMode;
          d.dampingVal = info.dampingVal;
          d.RSSI = deviceinfo.RSSI;
          d.name = deviceinfo.localName.replaceAll('\0', '');

          if (d.waterLevel) {
            d.waterLevel = info.waterLevel;
          }

          return;
        }
      }

      info.ftime = date.getTime();
      info.RSSI = deviceinfo.RSSI;
      info.name = deviceinfo.localName.replaceAll('\0', '');
      info.deviceid = deviceinfo.deviceId;
      //记录 name 和 蓝牙uuid rssi
      that.devicelist.push(info);
    }
  };

  // 从advertisData获得雷达测量信息
  this.__getRadarInfo = function (advertisData) {
    let advertisDataView = new Uint8Array(advertisData);
    let info = {};

    switch (advertisDataView[2]) {
      case 66:
        info.mAcurrentutputFunction = (advertisDataView[5] & 0xC0) >> 6
        info.mARealtimeValue = advertisDataView[3] * 0x100 + advertisDataView[4];
        info.sensorMode = (advertisDataView[5] & 0x30) >> 4;
        info.dampingVal = (advertisDataView[5] & 0x0F) * 0x10000 + advertisDataView[6] * 0x100 + advertisDataView[7];
        info.deviceType = '物位计';
        break;
      case 67:
        var app = getApp();
        info.modbus_addr = advertisDataView[3];
        info.sensorMode = 3;
        info.waterLevel = (advertisDataView[5] & 0x0F) * 65536 + (advertisDataView[6] * 256) + advertisDataView[7];
        info.deviceType = '水位计';
        break;
      case 68:
        var app = getApp();
        info.modbus_addr = advertisDataView[3];
        info.waterLevel = (advertisDataView[5] & 0x0F) * 65536 + (advertisDataView[6] * 256) + advertisDataView[7];
        info.sensorMode = 4;
        info.deviceType = '流速计';
        break;
      case 69:
        var app = getApp();
        info.modbus_addr = advertisDataView[3];
        info.waterLevel = (advertisDataView[5] & 0x0F) * 65536 + (advertisDataView[6] * 256) + advertisDataView[7];
        info.sensorMode = 5;
        info.deviceType = '流量计';
        break;
      default:
        break;
    }

    return info;
  }
}


module.exports = {
  bluetoothAdapter: bluetoothAdapter
}