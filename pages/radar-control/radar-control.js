// pages/index/index.js

import {
  setMenu
} from '../../utils/setmenu'
import {
  cmdParam
} from '../../utils/cmdparam'

var lang = require('../../utils/languageUtils');

var app = getApp();

Page({
  data: {
    // 是否已经成功登录 
    loggedIn: false,
    // 登录界面显示
    loginOpen: false,
    // blepin
    loginKey: '',
    // 设备系统平台
    platform: null,
    // 雷达实例
    radarCom: null,
    // ble信息
    bleInfo: {},
    // ble连接状态
    bleConnectStatus: false,
    // 手机蓝牙适配API接口实例
    bluetoothAdapter: null,
    // 雷达设置菜单
    setMenu: setMenu,
    // 雷达信息
    radarInfo_data: {},
    radarInfo_set: {},
    // 通讯错误
    commError: 0,
    // 蓝牙设备列表
    bleList: [],
    // Lcd曲线
    l_lcd_fft: [],
    l_lcd_tvt: [],
    // 是否开启远程协助功能
    remoteAssistance: true,
    // 远程协助RemoteId remotepk url
    remoteId: 'eBJRCEEDpm42erAebr6WGpS8GEDBnSNC',
    // remoteId: 'r2QADxjcJkkXthi7yTGpWyi5RCxnyfka',
    remotePk: 'temp',
    url: 'wss://wdxc-micro.com/wss',
    assistanceData: null,
    remoteAssistanceStatus: false,
    _lang: lang._lang(),
    versionReq: true,
  },

  // 接收设置参数信息
  onSetCmd(e) {
    let cmd = e.detail;
    // 设置雷达
    if (cmd) app.globalData.rad_com.setRadarCmd(cmd);
  },

  // 接收雷达信息更新 更新界面
  onUpdateRadarInfo(radarInfo) {
    switch (radarInfo.dataType) {
      case 'radarInfo':
        this.setData({
          radarInfo_data: radarInfo
        });
        break;
      case 'radarParam':
        this.setData({
          radarInfo_set: radarInfo,
          radarInfo_data: radarInfo
        });
        break;
      case 'LCDWave':
        let step, fft, tvt;
        if (radarInfo.farRange) {
          // 计算点间距
          step = parseFloat((radarInfo.farRange / 128).toFixed(3));
        } else {
          return;
        }
        if (radarInfo.lcd_echoCurve) {
          fft = radarInfo.lcd_echoCurve.map((p, i) => {
            return [i * step, p]
          });
          this.setData({
            l_lcd_fft: fft,
          });
        }
        if (radarInfo.lcd_TVTModifyCurve) {
          tvt = radarInfo.lcd_TVTModifyCurve.map((p, i) => {
            return [i * step, p]
          });
          this.setData({
            l_lcd_tvt: tvt,
          });
        }

        break;
    }

    if (cmdParam['softwareVersion'].data != '')
    {
      let verReq = this.analysisVersion(cmdParam['softwareVersion'].data);

      this.setData({
        versionReq: verReq,
      });
    }
  },

  // 蓝牙连接信息
  onbleConnected() {
    this.setData({
      bleConnectStatus: true,
      bleName: this.data.bleInfo.name,
    });
  },

  // 蓝牙断开信息
  onbleDisconnected() {
    this.setData({
      bleConnectStatus: false
    });

    wx.navigateBack({
      delta: 1
    });
  },

  // 登录状态变化
  onLoginStateChange(flag) {
    this.setData({
      loggedIn: flag
    })
  },

  // 远程协助组件成功登录事件 开启远程协助
  onRemoteAssisntanceLogin() {
    app.globalData.rad_com.remoteAssistanceStatus = true;
    this.setData({
      remoteAssistanceStatus: true,
    });
    // 停止主动周期向雷达发送命令 获得信息
    app.globalData.rad_com.stopSendCmdByCycle();
  },

  // 远程协助组件断开连接事件 取消远程协助
  onRemoteAssisntanceClose() {
    app.globalData.rad_com.remoteAssistanceStatus = false;
    this.setData({
      remoteAssistanceStatus: false,
    });
    // 开始周期从雷达获得信息
    app.globalData.rad_com.sendCmdByCycle();
  },

  // 远程协助组件收到数据 将数据通过蓝牙发送
  onRemoteAssisntanceData(data) {
    app.globalData.rad_com.sendCmd(data.detail.data);
  },

  on2RemoteAssistanceData(buf) {
    const child = this.selectComponent('#remoteAssistanceCom');
    if (child) child.sendData(buf);
  },

  analysisVersion(str) {
    let verList = str.split('.');
    
    switch (verList[1])
    {
      case "2":
        if (Number(verList[2])>=47)
        {
          return true;
        }
        else
        {
          return false;
        }
      case "3":
        if (Number(verList[2])>=17)
        {
          return true;
        }
        else
        {
          return false;
        }
      case "4":
        if (Number(verList[2])>=7)
        {
          return true;
        }
        else
        {
          return false;
        }
      default:
        return false;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 雷达 实例化 初始化
    var app = getApp();
    app.globalData.rad_com.device_type = '物位计';
    app.globalData.rad_com.callback_updateRadarInfo = this.onUpdateRadarInfo;
    app.globalData.rad_com.callback_bleDisconnected = this.onbleDisconnected;
    app.globalData.rad_com.callback_bleConnected = this.onbleConnected;
    app.globalData.rad_com.callback_bleLoginStateChange = this.onLoginStateChange;
    app.globalData.rad_com.callback_blerec = this.on2RemoteAssistanceData;
    app.globalData.rad_com.loginKey = options.key;
    app.globalData.rad_com.clearcomlist(1);
    app.globalData.rad_com.init();

    // 连接雷达ble
    app.globalData.rad_com.connectBle(options.deviceid);

    let _lang_tem = lang._lang();
    for (let i=0; i<this.data.setMenu.length; i++)
    {
      for (let k=0; k<this.data.setMenu[i].settings.length; k++)
      {
        if (this.data.setMenu[i].settings[k].type == 2)
        {
          for (let j=0; j<this.data.setMenu[i].settings[k].option.length; j++)
          {
            this.data.setMenu[i].settings[k].option[j] = _lang_tem[this.data.setMenu[i].settings[k].option[j]];
          }
        }
      }
    }

    this.setData({
      _lang: _lang_tem,
      setMenu: this.data.setMenu,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let res = wx.getSystemInfoSync()
    this.setData({
      platform: res.platform
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // 断开蓝牙连接
    app.globalData.rad_com.disConnectBle();
    // 退回蓝牙列表界面
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 断开蓝牙连接
    app.globalData.rad_com.disConnectBle();
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

  },

  // 用户关闭蓝牙列表界面
  onBleListCancel() {

  },

  // 用户打开蓝牙列表界面
  onBleListDisplay() {
    let adapter = this.data.bluetoothAdapter;
    if (adapter == null) return;
    // adapter已经开启 并在搜索设备
    if (adapter.ble_state.adapter_state && adapter.ble_state.discovery_state) return;
    // adapter已经开启 未搜索设备
    if (adapter.ble_state.adapter_state && !adapter.ble_state.discovery_state) {
      // 开始搜索BLE设备
      this.findBLEDevice();
    }
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
    let now = new Date();
    let list = deviceList.filter((d) => {
      return (now.getTime() - d.ftime) < 50000
    }).map((d) => {
      return {
        name: d.name,
        deviceid: d.deviceid,
        RSSI: d.RSSI,
      };
    }).sort((a, b) => {
      return b.RSSI - a.RSSI;
    });

    this.setData({
      bleList: list,
    });
  },

  // 连接蓝牙设备（雷达）
  onbleSelect(e) {

    if (this.data.bleInfo && app.globalData.rad_com.bleConnectState && app.globalData.rad_com.bleNotifyState && this.data.bleInfo.deviceid == e.detail.deviceid) {
      return;
    }

    this.setData({
      bleInfo: e.detail,
    });

    // 停止扫描ble 设备
    this.data.bluetoothAdapter.stopfind_BLEDevice();

    // 打开登录界面
    this.setData({
      loginOpen: true,
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

    // 判断是否为Android平台，提前配对
    app.globalData.rad_com.loginKey = this.data.loginKey;
    // 连接雷达ble
    app.globalData.rad_com.connectBle(this.data.bleInfo.deviceid);
    this.setData({
      loginOpen: false,
    });
  },

  // 关闭登录界面
  closeLogin() {
    this.setData({
      loginOpen: false,
      blePin: '',
    });
  },

  // 监控密码输入合法性
  bindKeyInputChange(e) {
    let key = e.detail.value.replace(/[^\d]/g, '');
    if (key.length > 6) key = key.slice(0, 6);
    this.setData({
      loginKey: key
    });
  },
})