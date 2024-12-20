// component/remoteAssistance/remote-assistance.js
import wsClient from "../../utils/wsClient_MCLink"
var lang = require('../../utils/languageUtils');
var app = getApp();


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    _lang: {
      type: Object,
      value: lang._lang(),
    },
    url: {
      type: String,
      value: '',
    },
    remoteId: {
      type: String,
      value: '',
    },
    remotePk: {
      type: String,
      value: '',
    },
    radarData: {
      type: ArrayBuffer,
      value: null,
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    pk: 'wx_wsGateway',
    id: '',
    remoteAssistanceSwitch: false,
    v_infoTips: '',

    ws:null,
  },
  pageLifetimes: {
    show: function () {
      this.milliseconds = new Date().getMilliseconds();
      // 页面被展示
      this.setData({
        v_infoTips: this.properties._lang['状态：关闭'],
        id: app.globalData.iot_deviceId ,
      });

    },
    hide: function () {
      // 页面被隐藏
      if(this.data.remoteAssistanceSwitch && this.ws){
        this.ws.close();
      }
    },
    resize: function (size) {
      // 页面尺寸变化
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 连接iot websocket开关
    switch1Change(e) {
      if (e.detail.value) {
        this.ws = new wsClient({
          url: this.data.url,
          id: this.data.id,
          pk: this.data.pk,
          remoteId: this.data.remoteId,
          remotePk: this.data.remotePk,
        });
        // 连接远端WebSocket 回调函数
        this.ws.callback_onOpen = this.onOpen.bind(this);
        this.ws.callback_onData = this.onData.bind(this);
        this.ws.callback_onLogin = this.onLogin.bind(this);
        this.ws.callback_onClose = this.onClose.bind(this);

        if (this.ws.connect()) {

        }
      } else {
        this.ws.close();
      }
      // 更新显示信息
      this.setData({
        v_infoTips: e.detail.value ? this.properties._lang['状态：连接中'] : this.properties._lang['状态：关闭'],
        remoteAssistanceSwitch: e.detail.value
      });
    },
    onOpen() {
      this.setData({
        v_infoTips: this.properties._lang['状态：登录中'],
      });
    },
    onClose() {
      this.triggerEvent('on-close');
      this.setData({
        v_infoTips: this.properties._lang['状态：连接断开'],
        remoteAssistanceSwitch: false,
      });
    },
    onLogin() {
      // 触发登录事件
      this.triggerEvent('on-login');
      this.setData({
        v_infoTips: this.properties._lang['状态：登录'] + this.data.id,
      });
    },
    onData(data) {
      // 触发接收数据事件
      this.triggerEvent('on-data', { data: data });
    },
    sendData(data) {
      if (this.ws) this.ws.sendData(data);
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
  }
})
