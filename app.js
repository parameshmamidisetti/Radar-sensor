//app.js
const TIMEOUT = 4000;
const RADARADDR = 1;


var radar_com = null;

App({
  globalData: {
    userInfo: null,
    iot_deviceId: null,
    ble_device: null,
    rad_com: null,
    modbus_addr: 1,
    currentLanguage: wx.getStorageSync('lang'),
  },
  onLaunch: function () {
    let that = this;
    //设置 不息屏
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
    // 读取用于连接IOT平台的deviceId,第一次启动创建ID
    wx.getStorage({
      key: 'iot_deviceId',
      success(res) {
        that.globalData.iot_deviceId = res.data;
      },
      fail() {
        let milliseconds = new Date().getMilliseconds();
        wx.setStorage({
          key: 'iot_deviceId',
          data: `${milliseconds}_${that.CreateId(5)}`,
          success(res){
            that.globalData.iot_deviceId = wx.getStorageSync('iot_deviceId');
          }
        });
      }
    })

  },
  //   创建随机ID
  CreateId(len) {
    len = len > 0 ? len : 32;
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
      a = t.length,
      n = "";
    for (let i = 0; i < len; i++)
      n += t.charAt(Math.floor(Math.random() * a));
    return n;
  },
})