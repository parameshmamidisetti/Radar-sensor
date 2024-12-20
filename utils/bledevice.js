var SERVICEUUID = 'FFE0';
var CHARUUID = 'FFE1';
var WATER_TRAN_SER = 'FFE2';
var WATER_TRAN_CHAR = 'FFE3';
var is_ble_listen_on = false;

/*
 *修改于7月20日 
 *1、增加 连接、断开、监听消息；
 *2、createBLEConnection 函数参数 去掉f=null 增加 uuid
 */
import {
    cmdParam
} from './cmdparam'

import {
    translate_radarcom,
    analysis_radardata
} from './analysisradardata'

function bledevice(deviceid = '', seruuidkey = SERVICEUUID, charuuidkey = CHARUUID) {
  this.seruuidkey = seruuidkey;
  this.charuuidkey = charuuidkey;

  this.deviceid = deviceid;
  this.seruuid = '';
  this.charuuid = '';
  this.water_tran_servuuid = '';
  this.water_tran_charuuid = '';
  this.device_type = '物位计';
  this.loginKey = '';

  this.ble_device = null; //选中连接的BLE设备
  this.blecon_state = false; //设备连接状态
  this.bleNotify_state = false; //蓝牙监听状态

  this.callback_blerec = null;
  this.callback_bleConnected = null;
  this.callback_bleDisconnected = null;
  this.callback_bleNotifyState = null;

  this.__begin_listen_ble_connect_state = function () {
    let that = this;
    const mtu = 230;
    if (is_ble_listen_on == true)
    {
      return;
    }
    
    wx.onBLEConnectionStateChange(function (res) {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`);
      console.log(res);
      // 连接成功/断开 信息
      that.blecon_state = res.connected;
      if (res.connected) {
        that.blecon_state = true;
        // 发送 连接成功信息
        if (that.callback_bleConnected) that.callback_bleConnected();
        //获得service 和 characteristic 特征值

        that.__getSerAndCharid();
      } else {
        // 连接断开
        if (that.callback_bleDisconnected) that.callback_bleDisconnected();
        if (that.bleNotify_state) {
          that.bleNotify_state = false;
          if (that.callback_bleNotifyState) that.callback_bleNotifyState(that.bleNotify_state);
        }
      }

      is_ble_listen_on = true;
    });
  }


  this.connectBle = function (uuid = '') {
    let that = this;
    const mtu = 512;
    if (uuid.length) that.deviceid = uuid;
    if (that.deviceid) {

      this.__begin_listen_ble_connect_state();
      // 连接BLE
      wx.createBLEConnection({
        deviceId: that.deviceid,
        success: (res) => {
          wx.getSystemInfo({
            success:function(res) {
              if (res.system.indexOf('iOS') > -1) {
                that.__getSerAndCharid();
              } else {
                wx.setBLEMTU({
                  deviceId: that.deviceid,//蓝牙设备ID
                  mtu: 512,
                  success:(res)=>{
                    console.log("setBLEMTU success>>", res);
                  },
                  fail:(res)=>{
                    console.log("setBLEMTU fail>>", res);
                  }
                });
              }

              console.log("get system info success!");
            },

            fail:(res) => {
              console.log(res)
            }
          })

          console.log(`connect success`)
        },
        fail: (res) => {
          console.log(`connect fail`)
        }
      });
    }
  };

  /*
   *得到service 和 characteristic 特征值 并开始监听ble信息
   */
  this.__getSerAndCharid = function () {
    let that = this;
    if (that.blecon_state) {
        switch (that.device_type)
        {
            case '物位计':
                wx.getBLEDeviceServices({
                    deviceId: that.deviceid, //搜索设备获得的蓝牙设备 id
                    success: (res) => {
                        //遍历找到包含FFE0的serviceid
                        res.services.forEach((ser) => {
                          if (ser.uuid.indexOf(that.seruuidkey) != -1) {
                              that.seruuid = ser.uuid;
                              //获取characteristic 特征值
                              wx.getBLEDeviceCharacteristics({
                              deviceId: that.deviceid,
                              serviceId: that.seruuid,
                              success: (res) => {
                                  res.characteristics.forEach(char => {
                                    if (char.uuid.indexOf(that.charuuidkey) != -1) {
                                        //得到characteristic 特征值
                                        that.charuuid = char.uuid;
                                        //开始监听BLE特征值变化
                                        that.__startBLEListen();
                                        console.log(this.loginKey);
                                    }
                                  })
                              }
                              });
                          }
                        })
                    },
                    fail(res) {
                        console.log(res);
                    }
                })
                break;

            case '流速计':
            case '流量计':
            case '水位计':
                wx.getBLEDeviceServices({
                    deviceId: that.deviceid, //搜索设备获得的蓝牙设备 id
                    success: (res) => {
                        //遍历找到包含FFE0的serviceid
                        res.services.forEach((ser) => {
                        if (ser.uuid.indexOf(that.seruuidkey) != -1) {
                            that.seruuid = ser.uuid;
                            //获取characteristic 特征值
                            wx.getBLEDeviceCharacteristics({
                                deviceId: that.deviceid,
                                serviceId: that.seruuid,
                                success: (res) => {
                                    res.characteristics.forEach(char => {
                                        if (char.uuid.indexOf(that.charuuidkey) != -1) {
                                            //得到characteristic 特征值
                                            that.charuuid = char.uuid;
                                        }
                                    })
                                }
                            })
                        }
                        else if (ser.uuid.indexOf(WATER_TRAN_SER) != -1) {
                            that.water_tran_servuuid = ser.uuid;
                            wx.getBLEDeviceCharacteristics({
                                deviceId: that.deviceid,
                                serviceId: that.water_tran_servuuid,
                                success: (res) => {
                                    res.characteristics.forEach(char => {
                                        if (char.uuid.indexOf(WATER_TRAN_CHAR) != -1) {
                                            //得到characteristic 特征值
                                            that.water_tran_charuuid = char.uuid;
                                            console.log(char.uuid);
                                            that.__startBLEListen_w();
                                        }
                                    })
                                }
                            })
                        }
                        })
                    },
                    fail(res) {
                        console.log(res);
                    }
                })
                break;

            default:
                break;
        }
    }
  };

  /**
   * 监听蓝牙信息
   */
  this.__startBLEListen = function () {
    let that = this;
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      deviceId: that.deviceid, //蓝牙设备id
      serviceId: that.seruuid, //服务id
      characteristicId: that.charuuid, //服务特征值indicate
      success: function (res) {
        console.log('开启notify', res.errMsg);
        that.bleNotify_state = true;
        if (that.callback_bleNotifyState) that.callback_bleNotifyState(that.bleNotify_state);
        //监听低功耗蓝牙设备的特征值变化
        wx.onBLECharacteristicValueChange(function (res) {
          let date = new Date();
          let t = date.getSeconds() + ':' + date.getMilliseconds()
          console.log(t, '--收:', that.__arrayBufferToHexString(res.value));
          //回调函数 ，发送接收到的字符串
          if (typeof that.callback_blerec === 'function') {
            that.callback_blerec(res.value)
          }
        })
      },
      fail: function (res) {
        console.log(res);
      }
    });
  };  

  this.__startBLEListen_w = function () {
    let that = this;
    let mtu = 512;
    console.log(that.seruuid);
    console.log(that.charuuid);
    wx.notifyBLECharacteristicValueChange({
      state: true, 
      deviceId: that.deviceid,
      serviceId: that.water_tran_servuuid,
      characteristicId: that.water_tran_charuuid,
      success: function (res) {
        console.log('开启notify', res.errMsg);
        that.bleNotify_state = true;
        if (that.callback_bleNotifyState) that.callback_bleNotifyState(that.bleNotify_state);

        wx.onBLECharacteristicValueChange(function (res) {
          let date = new Date();
          let t = date.getSeconds() + ':' + date.getMilliseconds()
          console.log(t, '--收:', that.__arrayBufferToHexString(res.value));

          if (typeof that.callback_blerec === 'function') {
            that.callback_blerec(res.value)
          }
        })
      },
      fail: function (res) {
        console.log(res);
      }
    });
  }
  /**
   * 向蓝牙设备发送信息
   */
  this.sendData = function (buffer) {
    switch (this.device_type)
    {
        case '物位计':
            var that = this;
            console.log(that.charuuid);
            wx.writeBLECharacteristicValue({
                deviceId: that.deviceid,
                serviceId: that.seruuid,
                characteristicId: that.charuuid,
                value: buffer,
                success: function (res) {
                    let date = new Date()
                    let t = date.getSeconds() + ':' + date.getMilliseconds()
                    console.log(t, '--发:', that.__arrayBufferToHexString(buffer));
                },
                fail:function(res){
                    console.log('ble send fail',res);
                }
            });
            break;

        case '流速计':
        case '流量计':
        case '水位计':
            var that = this;
            wx.writeBLECharacteristicValue({
                deviceId: that.deviceid,
                serviceId: that.water_tran_servuuid,
                characteristicId: that.water_tran_charuuid,
                value: buffer,
                success: function (res) {
                    let date = new Date()
                    let t = date.getSeconds() + ':' + date.getMilliseconds()
                    console.log(t, '--发:', that.__arrayBufferToHexString(buffer));
                },
                fail:function(res){
                    console.log('ble send fail',res);
                }
            });
            break;

        default:
            break;
    }
  };

  this.w_sendData = function (buffer, seruuid, charuuid) {
    var that = this;
    wx.writeBLECharacteristicValue({
        deviceId: that.deviceid,
        serviceId: seruuid,
        characteristicId: charuuid,
        value: buffer,
        success: function (res) {
            let date = new Date();
            let t = date.getSeconds() + ':' + date.getMilliseconds();
            console.log(t, '--发:', that.__arrayBufferToHexString(buffer));
        },
        fail:function(res){
            console.log('ble send fail',res);
        }
    });
  };

  /**
   * 关闭蓝牙连接
   */
  this.closeBLEConnection = function () {
    let that = this;
    this.loginKey = '';
    //断开蓝牙
    wx.closeBLEConnection({
      deviceId: that.deviceid,
      success: function (res) {
        that.blecon_state = false;
        if (that.callback_bleDisconnected)
        {
          switch (that.device_type)
          {
            case '流速计':
            case '流量计':
            case '水位计':            
              break;
            case '物位计':
              that.callback_bleDisconnected();
              break;
          }
        }

        if (that.bleNotify_state) {
          that.bleNotify_state = false;
          if (that.callback_bleNotifyState) that.callback_bleNotifyState(that.bleNotify_state);
        }
      },
      fail: function (res) {
        console.log(res);
      }
    });
  };

  /**
   *arraybuffer to hex
   */
  this.__arrayBufferToHexString = function (buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer),
      x => ('00' + x.toString(16)).slice(-2)).join('');
  };
}


module.exports = {
  bledevice: bledevice
}