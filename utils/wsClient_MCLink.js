class wsClient {
  constructor({ url, id, pk, remoteId, remotePk } = {}) {
    this.id = id;
    this.pk = pk;
    this.url = url;
    this.remoteId = remoteId;
    this.remotePk = remotePk;
    this.socket = null;
    this.userInfo = '';
    this.msgId = 0;
    this.heartCycle = 10 * 1000;

    this.callback_onOpen = null;
    this.callback_onData = null;
    this.callback_onLogin = null;
    this.callback_onClose = null;

    this.interval_heart_idx = 0;
    this.status_setTimeIdx = 0;
  }
  connect(url) {
    let that = this;
    if (url) this.url = url;
    if (!this.url) return;
    if (this.socket && this.socket.readyState == 1) this.socket.close();
    this.socket = wx.connectSocket({
      url: this.url,
    });

    if (!this.socket) {
      console.log('ws create error');
      return false;
    }
    this.socket.onMessage((data) => {
      // 判断连接状态
      that.__checkConnectStatus();
      that.__parseData(data.data);
    });
    this.socket.onOpen((result) => {
      // 登录
      that.__login();
      if (that.callback_onOpen) that.callback_onOpen(result);
    });
    this.socket.onClose((result) => {
      // 停止心跳
      clearInterval(that.interval_heart_idx);
      that.interval_heart_idx = 0;
      // 停止状态监测
      clearTimeout(that.status_setTimeIdx);
      that.status_setTimeIdx = 0;
      if (that.callback_onClose) that.callback_onClose(result);
    });

    return true;
  }
  close() {
    if (this.socket && this.socket.readyState == 1) {
      this.socket.close();
      this.socket = null;
    }
  }
  // 发送心跳
  __sendHeart() {
    let data = {
      act: "heart",
      pk: this.pk,
      id: this.id,
      msgId: this.msgId++,
      data: {
        userInfo: this.userInfo,
      }
    }
    if (this.socket && this.socket.readyState == 1) this.socket.send({ data: JSON.stringify(data) });
  }
  // 发送登录信息
  __login() {
    let data = {
      act: "login",
      pk: this.pk,
      id: this.id,
      msgId: this.msgId++,
      data: {
        userInfo: this.userInfo,
        remoteId: this.remoteId,
        remotePk: this.remotePk,
      }
    }
    // console.log(JSON.stringify(data));
    if (this.socket && this.socket.readyState == 1) this.socket.send({ data: JSON.stringify(data) });

  }
  // 解析接到的数据
  __parseData(data) {
    let that = this;
    let d = JSON.parse(data);
    let cmd = null;
    // 检查命令类型 以及 目标设备ID，根据编码类型转换命令数据
    if (d.act == "remoteSend" && d.data.devId == this.id) {
      if (d.data.encode == 'base64') cmd = wx.base64ToArrayBuffer(d.data.data);
      if (d.data.encode == 'utf-8') cmd = d.data.data;
      if (cmd && this.callback_onData) this.callback_onData(cmd);
    }
    // 收到平台登录成功反馈，启动心跳
    if (d.act == 'platformResp') {

      if (d.code == 1001) {
        if (this.interval_heart_idx) clearInterval(this.interval_heart_idx);
        this.interval_heart_idx = setInterval(() => {
          that.__sendHeart();
        }, this.heartCycle);
        if (this.callback_onLogin) this.callback_onLogin();
      }
    }
  }
  sendData(data) {
    let sendData = {
      act: "devSend",
      pk: this.pk,
      id: this.id,
      msgId: this.msgId++,
      data: {},
    };
    // 如果不是string类型数据，就应是buffer类型，进行base64编码转换
    if (typeof (data) == 'string') {
      sendData.data.encode = 'utf-8';
      sendData.data.data = data;
    } else {
      sendData.data.encode = 'base64';
      sendData.data.data = wx.arrayBufferToBase64(data);
    }
    if (this.socket && this.socket.readyState == 1) this.socket.send({ data: JSON.stringify(sendData) });
  }
  // 判断是否连接断开
  __checkConnectStatus() {
    let that = this;
    if (this.status_setTimeIdx) clearTimeout(this.status_setTimeIdx);
    // 超过心跳时间没有数据通讯则断开连接
    this.status_setTimeIdx = setTimeout(() => {
      if (that.socket) that.close();
    }, 2 * that.heartCycle + 5000);
  }
}

export default wsClient;