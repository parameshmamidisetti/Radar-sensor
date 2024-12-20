// pages/radar-list/radar-list.js
import {
  bluetoothAdapter
} from '../../utils/bluetoothAdapter'
import {
  radarCom
} from '../../utils/radarCom'
import {
  changeLanguage
} from '../../utils/languageUtils'
import {
  bledevice
} from '../../utils/bledevice'

var lang = require('../../utils/languageUtils');

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginOpen: false,
    loginKey: '',
    selectedDeviceid: '',
    selectedDevicemode: '',
    selectedDeviceName: '',
    selectedDeviceModbusAddr: 1,
    deviceType: '',
    bluetoothAdapter: null,
    // 蓝牙设备列表
    bleList: [],
    languageIndex: 0,
    languageArray: ['中文', 'English', 'Русский язык'],
    currentLanguage: '中文',
    _lang: lang._lang(),

    msg: '',
  },

  // 搜索蓝牙设备
  findBLEDevice() {
    //开启蓝牙搜索
    this.data.bluetoothAdapter.open_BLEAdapter({
      success: (res) => {
        //开始搜索蓝牙设备
        this.data.bluetoothAdapter.startfind_BLEDevice();
        //成功信息
        wx.showToast({
          title: res,
          icon: 'success',
          duration: 3000
        });
      },
      fail: (res) => {
        //未打开蓝牙
        wx.showToast({
          title: res,
          image: '../images/error.png',
          duration: 5000
        });
      }
    });
  },

  // 发现新BLE设备
  onNewBLEDevice(deviceList) {
    let that = this;
    let now = new Date();
    let list = deviceList.filter((d) => {
      return (now.getTime() - d.ftime) < 50000
    }).map((d) => {
      //console.log(d.deviceType);
      switch (d.deviceType) {
        case '物位计':
          return {
            name: d.name,
            deviceid: d.deviceid,
            RSSI: d.RSSI,
            v_mAcurrentutputFunction: that.getModeName(d.mAcurrentutputFunction),
            v_mARealtimeValue: d.mARealtimeValue / 1000,
            v_sensorMode: that.getModeName(d.sensorMode),
            v_dampingVal: d.dampingVal / 1000,
            deviceType: d.deviceType,
          }
          break;

        case '水位计':
          return {
            name: d.name,
            deviceid: d.deviceid,
            RSSI: d.RSSI,
            v_sensorMode: that.getModeName(d.sensorMode),
            v_waterLevel: d.waterLevel / 1000,
            deviceType: d.deviceType,
            modbus_addr: d.modbus_addr,
          }
          break;

        case '流速计':
          return {
            name: d.name,
            deviceid: d.deviceid,
            RSSI: d.RSSI,
            v_sensorMode: that.getModeName(d.sensorMode),
            flow_velocity: d.waterLevel / 1000,
            deviceType: d.deviceType,
          }
          break;

        case '流量计':
          return {
            name: d.name,
            deviceid: d.deviceid,
            RSSI: d.RSSI,
            v_sensorMode: that.getModeName(d.sensorMode),
            flow_velocity: d.waterLevel / 1000,
            deviceType: d.deviceType,
          }
          break;
      }
    }).sort((a, b) => {
      return b.RSSI - a.RSSI;
    });

    this.setData({
      bleList: list,
    });
  },

  // 获得传感器类型、电流函数类型 名称
  getModeName(type) {
    switch (type) {
      case 0:
        return '物位';
      case 1:
        return '空高';
      case 2:
        return '距离';
      case 3:
        return '水位';
      case 4:
        return '流速';
      case 5:
        return '流量';
    }

  },

  // 刷新ble设备
  cat_refreshBle() {
    //开启蓝牙搜索
    this.data.bluetoothAdapter.open_BLEAdapter({
      success: (res) => {
        //开始搜索蓝牙设备
        this.data.bluetoothAdapter.startfind_BLEDevice();
      },
      fail: (res) => {
        //未打开蓝牙
        wx.showToast({
          title: res,
          image: '../images/error.png',
          duration: 5000
        });
      }
    });
  },

  // 进入雷达配置界面
  cat_enterRadar(e) {
    // 得到选择的雷达deviceid
    this.data.selectedDeviceid = e.target.id;
    this.data.selectedDevicemode = e.target.dataset.devicemode;
    this.data.selectedDeviceName = e.target.dataset.devicename;
    this.data.selectedDeviceModbusAddr = e.target.dataset.devicemodbusaddr;
    this.setData({
      loginOpen: true
    });
  },

  // 连接蓝牙并验证登录密码
  btn_connectAndLogin() {
    // 判断密码是否6位 
    if (this.data.loginKey.length != 6) {
      // 提示密码长度错误
      wx.showToast({
        title: this.data._lang['密码长度错误'],
        image: '../../images/error.png',
        duration: 1000
      });
      return;
    }
    // 关闭蓝牙广播接收
    this.data.bluetoothAdapter.stopfind_BLEDevice();
    // 关闭登录窗口
    this.setData({
      loginOpen: false,
    });

    console.log(this.data.selectedDevicemode);
    console.log('../volume-control/volume-control?key=' + this.data.loginKey + '&deviceid=' + this.data.selectedDeviceid + '&ble_name=' + this.data.selectedDeviceName + '&modbus_addr=' + this.data.selectedDeviceModbusAddr,);
    // 跳转页面
    switch (this.data.selectedDevicemode) {
      case '水位':
        wx.navigateTo({
          url: '../water-control-2/water-control-2?key=' + this.data.loginKey + '&deviceid=' + this.data.selectedDeviceid + '&ble_name=' + this.data.selectedDeviceName + '&modbus_addr=' + this.data.selectedDeviceModbusAddr,
        });
        break;
      case '流速':
        wx.navigateTo({
          url: '../flow-control/flow-control?key=' + this.data.loginKey + '&deviceid=' + this.data.selectedDeviceid + '&ble_name=' + this.data.selectedDeviceName + '&modbus_addr=' + this.data.selectedDeviceModbusAddr,
          //console(url);
        });
        break;
      case '流量':  
        wx.navigateTo({
          url: '../volume-control/volume-control?key=' + this.data.loginKey + '&deviceid=' + this.data.selectedDeviceid + '&ble_name=' + this.data.selectedDeviceName + '&modbus_addr=' + this.data.selectedDeviceModbusAddr,
        });
        break;
      default:
        wx.navigateTo({
          url: '../radar-control/radar-control?key=' + this.data.loginKey + '&deviceid=' + this.data.selectedDeviceid,
          //console(url);
        });
        break;
    }
  },

  // 监控密码输入合法性
  bindKeyInputChange(e) {
    let key = e.detail.value.replace(/[^\d]/g, '');
    if (key.length > 6) key = key.slice(0, 6);
    this.setData({
      loginKey: key,
    })
  },

  // 关闭登录界面
  closeLogin() {
    this.setData({
      loginOpen: false,
      bleKey: '',
    });
  },

  changeLang(e) {
    let langIndex = 0;
    langIndex = e.detail.value;
    changeLanguage(langIndex);

    this.setData({
      currentLanguage: this.data.languageArray[e.detail.value],
      _lang: lang._lang(),
    });

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // bluetoothAdapter API 实例化
    var app = getApp();
    app.globalData.rad_com = new radarCom();
    app.globalData.ble_device = new bledevice();
    this.data.bluetoothAdapter = new bluetoothAdapter();
    this.data.bluetoothAdapter.callback_blelistchange = this.onNewBLEDevice;
    if (app.globalData.currentLanguage == "en") {
      this.setData({
        currentLanguage: this.data.languageArray[1],
      });
    }
    else if (app.globalData.currentLanguage == "zh") {
      this.setData({
        currentLanguage: this.data.languageArray[0],
      });
    }
    else if (app.globalData.currentLanguage == "ru") {
      this.setData({
        currentLanguage: this.data.languageArray[2],
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    setTimeout(() => {
      that.findBLEDevice();
    }, 1000);

    wx.getSystemInfo({
      success(res) {
        that.setData({
          msg: `品牌：${res.brand},型号：${res.model},系统：${res.system},设备性能：${res.benchmarkLevel}`
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    setTimeout(() => {
      that.findBLEDevice();
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})