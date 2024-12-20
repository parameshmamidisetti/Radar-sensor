// pages/flow-control/flow-control.js
import {
  f_setMenu,
  f_setList
} from '../../utils/v_setmenu'
import {
  translate_radarcom,
} from '../../utils/analysisradardata'
import {
  f_cmdParam
} from '../../utils/v_cmdparam'
import {
  buf2int,
  buf2float,
  buf2str
} from '../../utils/analysisradardata'


var app = getApp();
var lang = require('../../utils/languageUtils');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ble_device: null,
    // 是否已经成功登录
    loggedIn: false,
    // blepin
    loginKey: '',
    // 设备系统平台
    platform: null,
    // ble信息
    bleInfo: {},
    // ble连接状态
    bleConnectStatus: false,
    bleNotifyState: false,
    // 手机蓝牙适配API接口实例
    bluetoothAdapter: null,
    // 雷达设置菜单
    setMenu: f_setMenu,
    f_setList: f_setList,
    // 雷达信息
    radarInfo_data: {},
    radarInfo_set: {},
    measureResult: '0',
    angleValue: '0',
    totalVolume: '0',
    waterLevel: '0',
    meanFlow: '0',
    realTimeFlow: '0',
    // 通讯错误
    commError: 0,
    // 蓝牙设备列表
    bleList: [],
    // Lcd曲线
    curveSendTimes: 8,
    new_curveSendTimes: 8,
    lastSendCountPoint: 0,
    cruveStep: 0,
    echo_fft: [],
    echo_tvt: [],
    echo_tvt_base: [],
    echo_fft_tem: [],
    echo_tvt_tem: [],
    echo_tvt_base_tem: [],
    ble_name: '',
    currentSenID: null,
    _lang: lang._lang(),

    sendQueueObject: {
      'commandSendQueue': [],
    },
    readWaveFlag: false,
    sendWaveQueueObject: {
      'commandSendQueue': [],
      'totalCommandCount': 0,
      'hasSendCommandCount': 0,
    },
    readWaveMaxCount: 10,
    sensorSelfOffset: 0,
    D_R: 0,
    ADCSampleRate: 9375,
    pointCount: 1024,
    drawCount: 500,
    maxFlow: 60.0,
    step: 0.049,
    buttonLock: true,
  },

  /**锁定按钮 防止快速点击导致数据错乱 */
  lockButton() {
    this.setData({
      buttonLock: true,
    });

    setTimeout(() => {
      this.setData({
        buttonLock: false,
      });
    }, 500);
  },

  /**弹窗显示 */
  showToast(showString, showTime) {
    wx.showToast({
      title: this.data._lang[showString],
      duration: showTime,
    });
  },

  /**读取按钮事件回调 */
  onReadcmd(e) {
    let cmd = e.detail;
    let variable = cmd.variable;
    let id = parseInt(cmd.id);
    let id2 = parseInt(cmd.id2);
    var app = getApp();

    this.data.sendQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: f_cmdParam.fc_Read2,
      register_addr: f_cmdParam[variable].addr,
      registerCount: f_cmdParam[variable].registerCount,
      type: 'paramRead',
      isRec: false,
      variable: variable,
      id_1: id,
      id_2: id2,
    });

    if (this.data.readWaveFlag) {
      this.stopReadEcho();
      this.showToast(this.data._lang['结束读波形'], 1000);
    }

    app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);

    this.lockButton();
  },

  /**设置按钮事件回调 */
  onWritecmd(e) {
    let cmd = e.detail;
    let id = parseInt(cmd.id);
    let id2 = parseInt(cmd.id2);
    let variable = cmd.variable;
    let comData = null;
    var app = getApp();

    if (this.data.f_setList[id].items[id2].option) {
      let select_num = this.data.f_setList[id].items[id2].option.indexOf(cmd.text);

      comData = {
        radar_addr: app.globalData.modbus_addr,
        funcode: f_cmdParam.fc_Set,
        register_addr: f_cmdParam[variable].addr,
        registerCount: f_cmdParam[variable].registerCount,
        datalen2: f_cmdParam[variable].dataLen,
        data: select_num,
        type: 'paramSet',
        isRec: false,
      }
    } else {
      switch (this.data.f_setList[id].items[id2].head) {
        case 'TVT余量':
          comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: f_cmdParam.fc_Set,
            register_addr: f_cmdParam[variable].addr,
            registerCount: f_cmdParam[variable].registerCount,
            datalen2: f_cmdParam[variable].dataLen,
            data: this.data.f_setList[id].items[id2].backupValue & 0xFF00 | Number(cmd.text),
            type: 'paramSet',
            isRec: false,
          }
          break;
        case '阈值余量':
          comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: f_cmdParam.fc_Set,
            register_addr: f_cmdParam[variable].addr,
            registerCount: f_cmdParam[variable].registerCount,
            datalen2: f_cmdParam[variable].dataLen,
            data: this.data.f_setList[id].items[id2].backupValue | Number(cmd.text) << 8,
            type: 'paramSet',
            isRec: false,
          }
          break;
        case '蓝牙名称':
          if (cmd.text.length <= 12) {
            for (let i = 0; i < 12 - cmd.text.length; i++) {
              cmd.text += '\0';
            }
          } else {
            wx.showToast({
              title: '名称长度超过十二个字符',
              image: '../../images/error.png',
              duration: 1000
            });
            return;
          }

          comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: f_cmdParam.fc_Set,
            register_addr: f_cmdParam[variable].addr,
            registerCount: f_cmdParam[variable].registerCount,
            datalen2: f_cmdParam[variable].dataLen,
            data: cmd.text,
            type: 'paramSet',
            isRec: false,
          }
          break;
        case '蓝牙密码':
          if (cmd.text.length != 6) {
            wx.showToast({
              title: _lang['密码长度错误'],
              image: '../../images/error.png',
              duration: 1000
            });

            return;
          }
          comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: f_cmdParam.fc_Set,
            register_addr: f_cmdParam[variable].addr,
            registerCount: f_cmdParam[variable].registerCount,
            datalen2: f_cmdParam[variable].dataLen,
            data: cmd.text,
            type: 'paramSet',
            isRec: false,
          }
          break;
        case '最大流速':
          this.data.maxFlow = Number(cmd.text);
          this.data.drawCount = Math.round(this.data.maxFlow / this.data.step);
          comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: f_cmdParam.fc_Set,
            register_addr: f_cmdParam[variable].addr,
            registerCount: f_cmdParam[variable].registerCount,
            datalen2: f_cmdParam[variable].dataLen,
            data: Number(cmd.text),
            type: 'paramSet',
            isRec: false,
          }
          break;
        case '响应速度上':
          comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: f_cmdParam.fc_Set,
            register_addr: f_cmdParam[variable].addr,
            registerCount: f_cmdParam[variable].registerCount,
            datalen2: f_cmdParam[variable].dataLen,
            data: Number(cmd.text) * 100,
            type: 'paramSet',
            isRec: false,
          }
          break;
        case '响应速度下':
          comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: f_cmdParam.fc_Set,
            register_addr: f_cmdParam[variable].addr,
            registerCount: f_cmdParam[variable].registerCount,
            datalen2: f_cmdParam[variable].dataLen,
            data: Number(cmd.text) * 100,
            type: 'paramSet',
            isRec: false,
          }
          break;
        case '累计流量':
          comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: f_cmdParam.fc_Set,
            register_addr: 0xC0B5,
            registerCount: f_cmdParam[variable].registerCount,
            datalen2: f_cmdParam[variable].dataLen,
            data: 1,
            type: 'paramSet',
            isRec: false,
          }
          break;
        default:
          comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: f_cmdParam.fc_Set,
            register_addr: f_cmdParam[variable].addr,
            registerCount: f_cmdParam[variable].registerCount,
            datalen2: f_cmdParam[variable].dataLen,
            data: Number(cmd.text),
            type: 'paramSet',
            isRec: false,
          };
          break;
      }
    }

    this.data.f_setList[id].items[id2].value = cmd.text;
    if (this.data.readWaveFlag) {
      this.stopReadEcho();
      this.showToast(this.data._lang['结束读波形'], 1000);
    }

    this.data.sendQueueObject.commandSendQueue.push(comData);
    app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);

    this.lockButton();
  },

  /**回复报文解析 */
  modbus_analysis(buffer, name) {
    let result;
    try {
      let d_dataView = new DataView(buffer, 3, f_cmdParam[name].dataLen);
      switch (f_cmdParam[name].dataLen) {
        case 2:
          result = buf2int(d_dataView);
          break;
        case 4:
          result = buf2float(d_dataView).toFixed(3);
          break;
        case 6:
        case 12:
          result = '';
          for (let s = 0; s < f_cmdParam[name].dataLen; s += 2) {
            let c1 = d_dataView.getUint8(s + 1)
            if (c1 < 32 || c1 > 126) {
              c1 = 32; //不可见字符转为空格
            }
            let c2 = d_dataView.getUint8(s)
            if (c2 < 32 || c2 > 126) {
              c2 = 32; //不可见字符转为空格
            }
            result += String.fromCharCode(c2);
            result += String.fromCharCode(c1);
          }
          default:
            break;
      }
      return result;
    } catch {
      return NaN;
    }
  },

  /**初始化读参数 将指令推进指令列表 */
  initReadParam() {
    this.data.f_setList.forEach(elements => {
      elements.items.forEach(element => {
        switch (element.head) {
          case '从机地址':
            this.data.sendQueueObject.commandSendQueue.push({
              radar_addr: 0,
              funcode: f_cmdParam.fc_Read2,
              register_addr: f_cmdParam[element.variable].addr,
              registerCount: f_cmdParam[element.variable].registerCount,
              variable: element.variable,
              id_1: elements.id,
              id_2: element.id,
              type: 'param',
            });
            break;
          default:
            this.data.sendQueueObject.commandSendQueue.push({
              radar_addr: app.globalData.modbus_addr,
              funcode: f_cmdParam.fc_Read2,
              register_addr: f_cmdParam[element.variable].addr,
              registerCount: f_cmdParam[element.variable].registerCount,
              variable: element.variable,
              id_1: elements.id,
              id_2: element.id,
              type: 'param',
            });
            break;
        }

      });
    });

    this.data.sendQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: f_cmdParam.fc_Read,
      register_addr: f_cmdParam.D_R.addr,
      registerCount: f_cmdParam.D_R.registerCount,
      type: 'midParam',
      paramType: 'D_R',
    });

    this.data.sendQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: f_cmdParam.fc_Read,
      register_addr: f_cmdParam.sensorSelfOffset.addr,
      registerCount: f_cmdParam.sensorSelfOffset.registerCount,
      type: 'midParam',
      paramType: 'sensorSelfOffset',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.globalData.ble_device.deviceid = options.deviceid;
    app.globalData.modbus_addr = 1;
    app.globalData.ble_device.device_type = this.data._lang['流量计'];
    //绑定 接收信息的回调函数
    app.globalData.ble_device.callback_blerec = this.onBleReceive;
    // 绑定 蓝牙 连接 断开信息
    app.globalData.ble_device.callback_bleConnected = this.onBleConnect;
    app.globalData.ble_device.callback_bleDisconnected = this.onBleDisconnect;
    app.globalData.ble_device.callback_bleNotifyState = this.onBleNotifyState;

    this.data.loginKey = options.key;
    this.data.ble_name = options.ble_name;

    console.log('开始执行 app.globalData.ble_device.connectBle(options.deviceid)');
    app.globalData.ble_device.connectBle(options.deviceid);
    this.initWaveQueue();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    app.globalData.ble_device.closeBLEConnection();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**收到报文回调函数 */
  onBleReceive(buffer) {
    if (this.data.readWaveFlag) {
      switch (this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].type) {
        case 'timerParam':
          let v = NaN;
          switch (this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].valueType) {
            case 'queryMeasureResult':
              v = this.modbus_analysis(buffer, 'queryMeasureResult');

              this.setData({
                measureResult: String(v),
              });
              break;
            case 'angleValue':
              v = this.modbus_analysis(buffer, 'angleValue');
              if (v > 9000) {
                v = NaN;
              }

              this.setData({
                angleValue: String(v / 100),
              });
              break;
            case 'totalVolume':
              v = this.modbus_analysis(buffer, 'totalVolume');
              // if (v > 9000) {
              //   v = NaN;
              // }
              this.setData({
                totalVolume: String(v),
              });
              break;
            case 'waterLevel':
              v = this.modbus_analysis(buffer, 'waterLevel');
              // if (v > 9000) {
              //   v = NaN;
              // }
              this.setData({
                waterLevel: String(v),
              });
              break;
            case 'meanFlow':
              v = this.modbus_analysis(buffer, 'meanFlow');
              // if (v > 9000) {
              //   v = NaN;
              // }
              this.setData({
                meanFlow: String(v),
              });
              break;
            case 'realTimeFlow':
              v = this.modbus_analysis(buffer, 'realTimeFlow');
              // if (v > 9000) {
              //   v = NaN;
              // }
              this.setData({
                realTimeFlow: String(v),
              });
              break;
          }

          this.data.sendWaveQueueObject.hasSendCommandCount++;

          app.globalData.ble_device.sendData(translate_radarcom(this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount]), true);
          break;

        case 'startState':
        case 'startWave':
          this.data.sendWaveQueueObject.hasSendCommandCount++;

          app.globalData.ble_device.sendData(translate_radarcom(this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount]), true);
          break;

        case 'EchoCurve':
          if (this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id != this.data.readWaveMaxCount) {
            try {
              let d_dataView = new DataView(buffer, 3, f_cmdParam.EchoCurve.list[this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id].registerCount * 2);
              for (let i = 0; i < f_cmdParam.EchoCurve.list[this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id].registerCount * 2; i += 2) {
                this.data.echo_fft_tem.push(d_dataView.getUint16(i) / 500);
              }
            } catch {
              app.globalData.ble_device.sendData(translate_radarcom(this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount]), true);
              break;
            }
          } else {
            this.data.echo_fft_tem = this.data.echo_fft_tem.map((p, i) => {
              return [i * this.data.step, p];
            });

            this.setData({
              echo_fft: this.data.echo_fft_tem.slice(0, this.data.drawCount),
              echo_fft_tem: [],
            });
          }

          this.data.sendWaveQueueObject.hasSendCommandCount++;

          app.globalData.ble_device.sendData(translate_radarcom(this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount]), true);
          break;

        case 'ThreadholdCurve':
          if (this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id != this.data.readWaveMaxCount) {
            try {
              let d_dataView = new DataView(buffer, 3, f_cmdParam.EchoCurve.list[this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id].registerCount * 2);
              for (let i = 0; i < f_cmdParam.EchoCurve.list[this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id].registerCount * 2; i += 2) {
                this.data.echo_tvt_tem.push(d_dataView.getUint16(i) / 500);
              }
            } catch {
              app.globalData.ble_device.sendData(translate_radarcom(this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount]), true);
              break;
            }
          } else {
            this.data.echo_tvt_tem = this.data.echo_tvt_tem.map((p, i) => {
              return [i * this.data.step, p];
            });

            this.setData({
              echo_tvt: this.data.echo_tvt_tem.slice(0, this.data.drawCount),
              echo_tvt_tem: [],
            });
          }

          this.data.sendWaveQueueObject.hasSendCommandCount++;

          if (this.data.sendWaveQueueObject.hasSendCommandCount == this.data.sendWaveQueueObject.totalCommandCount) {
            this.data.sendWaveQueueObject.hasSendCommandCount = 0;
          }

          app.globalData.ble_device.sendData(translate_radarcom(this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount]), true);
          break;
      }
    } else {
      try {
        switch (this.data.sendQueueObject.commandSendQueue[0].type) {
          case 'param':
            let id_1 = this.data.sendQueueObject.commandSendQueue[0].id_1;
            let id_2 = this.data.sendQueueObject.commandSendQueue[0].id_2;
            let value = this.modbus_analysis(buffer, this.data.sendQueueObject.commandSendQueue[0].variable);

            switch (this.data.sendQueueObject.commandSendQueue[0].variable) {
              case 'maxFlow':
                this.data.maxFlow = value;
                break;
              case 'slaveAddr':
                break;
            }

            switch (this.data.f_setList[id_1].items[id_2].type) {
              case "text":
                switch (this.data.sendQueueObject.commandSendQueue[0].variable) {
                  case 'thresholdMargin':
                    this.data.f_setList[id_1].items[id_2].backupValue = value;
                    value = value & 0x00FF;
                    this.data.f_setList[id_1].items[id_2].value = String(value);
                    break;
                  case 'thresholdMarginWater':
                    this.data.f_setList[id_1].items[id_2].backupValue = value & 0x00ff;
                    value = (value >> 8) & 0x00FF;
                    this.data.f_setList[id_1].items[id_2].value = String(value);
                    break;
                  case 'feedRate':
                    this.data.f_setList[id_1].items[id_2].value = String(value / 100);
                    break;
                  case 'dischargeRate':
                    this.data.f_setList[id_1].items[id_2].value = String(value / 100);
                    break;
                  default:
                    this.data.f_setList[id_1].items[id_2].value = String(value);
                    break;
                }
                break;

              case "select":
                this.data.f_setList[id_1].items[id_2].value = this.data.f_setList[id_1].items[id_2].option[value];
                break;
            }

            this.setData({
              f_setList: this.data.f_setList,
            });

            this.data.sendQueueObject.commandSendQueue.shift();
            if (this.data.sendQueueObject.commandSendQueue.length != 0) {
              app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
            }
            break;

          case 'midParam':
            switch (this.data.sendQueueObject.commandSendQueue[0].paramType) {
              case 'D_R':
                this.data.D_R = this.modbus_analysis(buffer, 'D_R');
                break;
              case 'sensorSelfOffset':
                this.data.sensorOffset = this.modbus_analysis(buffer, 'sensorSelfOffset');
                this.data.step = parseFloat(((this.data.D_R * this.data.ADCSampleRate) / this.data.pointCount).toFixed(3));

                this.data.drawCount = Math.round(this.data.maxFlow / this.data.step);

                this.showToast(this.data._lang["初始化读参数成功"], 1000);

                this.setData({
                  buttonLock: false,
                });
                break;
            }

            this.data.sendQueueObject.commandSendQueue.shift();
            if (this.data.sendQueueObject.commandSendQueue.length != 0) {
              app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
            }
            break;

          case 'paramRead':
            if (this.data.sendQueueObject.commandSendQueue[0].isRec) {
              let id_1 = this.data.sendQueueObject.commandSendQueue[0].id_1;
              let id_2 = this.data.sendQueueObject.commandSendQueue[0].id_2;
              let value = this.modbus_analysis(buffer, this.data.sendQueueObject.commandSendQueue[0].variable);

              switch (this.data.sendQueueObject.commandSendQueue[0].variable) {
                case 'maxFlow':
                  this.data.maxFlow = value;
                  this.data.drawCount = Math.round(this.data.maxFlow / this.data.step);
                  break;
                case 'slaveAddr':
                  break;
              }

              switch (this.data.f_setList[id_1].items[id_2].type) {
                case "text":
                  if (this.data.sendQueueObject.commandSendQueue[0].variable == 'thresholdMargin') {
                    this.data.f_setList[id_1].items[id_2].backupValue = value;
                    value = value & 0x00FF;
                    this.data.f_setList[id_1].items[id_2].value = String(value);
                  } else if (this.data.sendQueueObject.commandSendQueue[0].variable == 'thresholdMarginWater') {
                    this.data.f_setList[id_1].items[id_2].backupValue = value & 0x00ff;
                    value = (value >> 8) & 0x00FF;
                    this.data.f_setList[id_1].items[id_2].value = String(value);
                  } else if (this.data.sendQueueObject.commandSendQueue[0].variable == 'feedRate') {
                    this.data.f_setList[id_1].items[id_2].value = String(value / 100);
                  } else if (this.data.sendQueueObject.commandSendQueue[0].variable == 'dischargeRate') {
                    this.data.f_setList[id_1].items[id_2].value = String(value / 100);
                  } else {
                    this.data.f_setList[id_1].items[id_2].value = String(value);
                  }
                  break;

                case "select":
                  this.data.f_setList[id_1].items[id_2].value = this.data.f_setList[id_1].items[id_2].option[value];
                  break;
              }

              this.setData({
                f_setList: this.data.f_setList,
              });

              this.data.sendQueueObject.commandSendQueue.shift();
              if (this.data.sendQueueObject.commandSendQueue.length != 0) {
                app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
                this.data.sendQueueObject.commandSendQueue[0].isRec = true;
              }

              wx.showToast({
                title: this.data._lang['读取成功'],
                icon: 'success',
                duration: 500,
              });
            } else {
              app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
              this.data.sendQueueObject.commandSendQueue[0].isRec = true;
            }
            break;

          case 'paramSet':
            if (this.data.sendQueueObject.commandSendQueue[0].isRec) {
              this.data.sendQueueObject.commandSendQueue.shift();
              if (this.data.sendQueueObject.commandSendQueue.length != 0) {
                app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
              }

              this.setData({
                f_setList: this.data.f_setList,
              });

              wx.showToast({
                title: this.data._lang['设置成功'],
                icon: 'success',
                duration: 500,
              });
            } else {
              app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
              this.data.sendQueueObject.commandSendQueue[0].isRec = true;
            }
            break;

          default:
            this.data.sendQueueObject.commandSendQueue.shift();
            if (this.data.sendQueueObject.commandSendQueue.length != 0) {
              app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
            }
            break;
        }
      } catch (e) {
        console.log(e);
      }

    }
  },

  /**蓝牙连接事件回调 */
  onBleConnect() {
    this.setData({
      bleConnectStatus: true,
    });
    // 清空雷达信息
    this.radarInfo = {};
    // 显示蓝牙连接成功
    wx.showToast({
      title: this.data._lang['蓝牙已连接'],
      image: '../../images/btcon.png',
      duration: 2000
    });
    if (this.callback_bleConnected) this.callback_bleConnected();
  },

  /**蓝牙断开连接事件回调 */
  onBleDisconnect() {
    this.setData({
      bleConnectStatus: false,
      loggedIn: false,
      loginKey: '',
    });

    // 判断是否是登录失败
    this.onBLELoginBack(false);
  },

  /**蓝牙登录状态改变 */
  onBLELoginBack(flag) {
    this.bleLoginState = flag;
    this.setData({
      loggedIn: flag,
    });

    if (flag) {
      wx.showToast({
        title: this.data._lang['蓝牙已连接'],
        image: '../../images/btcon.png',
        duration: 3000
      });
    } else {
      wx.showToast({
        title: this.data._lang['蓝牙已断开'],
        image: '../../images/error.png',
        content: '',
      });

      wx.navigateBack({
        delta: 1
      });
    }
  },

  /**登录蓝牙函数发送指定报文到水位计蓝牙板 */
  loginBLE() {
    this.setData({
      loggedIn: true,
    });

    console.log(app.globalData);
    app.globalData.ble_device.w_sendData(translate_radarcom({
      radar_addr: app.globalData.modbus_addr,
      funcode: f_cmdParam.fc_Set,
      register_addr: f_cmdParam.bleLogin.addr,
      registerCount: f_cmdParam.bleLogin.registerCount,
      datalen2: f_cmdParam.bleLogin.dataLen,
      data: this.data.loginKey,
    }), app.globalData.ble_device.seruuid, app.globalData.ble_device.charuuid);


    this.onBLELoginBack(true);

    console.log('开始初始化读参数');
    this.initReadParam();
    console.log('完成初始化读参数');

    this.showToast(this.data._lang["开始初始化读参数"], 1000);
    app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
  },

  /**蓝牙notify状态改变回调 */
  onBleNotifyState() {

    if (this.data.bleNotifyState == false) {
      console.log('开始loginBLE');
      this.loginBLE();

      this.setData({
        bleNotifyState: true,
      });
    } else {
      this.setData({
        bleNotifyState: false,
      });
    }
  },

  /**初始化波形指令队列，将读水位、读波形指令添加进列表中 */
  initWaveQueue() {
    this.setData({
      sendWaveQueueObject: {
        'commandSendQueue': [],
        'totalCommandCount': 0,
        'hasSendCommandCount': 0,
      },
    });
    // add read flow velocity
    this.data.sendWaveQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: f_cmdParam.fc_Read,
      register_addr: f_cmdParam.queryMeasureResult.addr,
      registerCount: f_cmdParam.queryMeasureResult.registerCount,
      type: 'timerParam',
      valueType: 'queryMeasureResult'
    });

    this.data.sendWaveQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: f_cmdParam.fc_Read,
      register_addr: f_cmdParam.angleValue.addr,
      registerCount: f_cmdParam.angleValue.registerCount,
      type: 'timerParam',
      valueType: 'angleValue'
    });

    // add read wave start
    this.data.sendWaveQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: f_cmdParam.fc_Set,
      register_addr: f_cmdParam.uploadWave.addr,
      registerCount: f_cmdParam.uploadWave.registerCount,
      datalen2: f_cmdParam.uploadWave.dataLen,
      type: 'startWave',
      data: f_cmdParam.uploadWave.start,
    });

    // 总流量
    this.data.sendWaveQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: f_cmdParam.fc_Read,
      register_addr: f_cmdParam.totalVolume.addr,
      registerCount: f_cmdParam.totalVolume.registerCount,
      type: 'timerParam',
      valueType: 'totalVolume'
    });

    // 水位
    this.data.sendWaveQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: f_cmdParam.fc_Read,
      register_addr: f_cmdParam.waterLevel.addr,
      registerCount: f_cmdParam.waterLevel.registerCount,
      type: 'timerParam',
      valueType: 'waterLevel'
    });

    // 实时流速
    this.data.sendWaveQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: f_cmdParam.fc_Read,
      register_addr: f_cmdParam.realTimeFlow.addr,
      registerCount: f_cmdParam.realTimeFlow.registerCount,
      type: 'timerParam',
      valueType: 'realTimeFlow'
    });

    // 平均流速
    this.data.sendWaveQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: f_cmdParam.fc_Read,
      register_addr: f_cmdParam.meanFlow.addr,
      registerCount: f_cmdParam.meanFlow.registerCount,
      type: 'timerParam',
      valueType: 'meanFlow'
    });

    this.data.sendWaveQueueObject.totalCommandCount += 7;

    // add wave
    f_cmdParam.EchoCurve.list.forEach(element => {
      this.data.sendWaveQueueObject.commandSendQueue.push({
        radar_addr: app.globalData.modbus_addr,
        funcode: f_cmdParam.fc_Read,
        register_addr: f_cmdParam.EchoCurve.addr + element.id * element.registerCount,
        registerCount: element.registerCount,
        type: 'EchoCurve',
        id: element.id,
      });

      this.data.sendWaveQueueObject.totalCommandCount++;
    });

    f_cmdParam.ThreadholdCurve.list.forEach(element => {
      this.data.sendWaveQueueObject.commandSendQueue.push({
        radar_addr: app.globalData.modbus_addr,
        funcode: f_cmdParam.fc_Read,
        register_addr: f_cmdParam.ThreadholdCurve.addr + element.id * element.registerCount,
        registerCount: element.registerCount,
        type: 'ThreadholdCurve',
        id: element.id,
      });

      this.data.sendWaveQueueObject.totalCommandCount++;
    });
  },

  /**停止读波形函数 */
  stopReadEcho() {
    this.data.sendWaveQueueObject.hasSendCommandCount = 0;

    this.setData({
      readWaveFlag: false,
    });
  },

  /**开始读波形函数 */
  startReadEcho() {
    this.data.sendWaveQueueObject.hasSendCommandCount = 0;
    app.globalData.ble_device.sendData(translate_radarcom(this.data.sendWaveQueueObject.commandSendQueue[0]), true);

    this.setData({
      readWaveFlag: true,
    });
  },

  /**开始读波形点击事件回调 */
  onChartClick(e) {
    this.lockButton();

    if (!this.data.readWaveFlag) {
      this.startReadEcho();

      wx.showToast({
        title: this.data._lang['开始读波形'],
        duration: 1500
      });
    } else {
      this.data.sendQueueObject.isRpeat = false;
      this.data.sendQueueObject.commandSendQueue = [];
      this.data.sendQueueObject.totalCommandCount = 0;
      this.data.sendQueueObject.hasSendCommandCount = 0;

      this.setData({
        readWaveFlag: false,
      })

      wx.showToast({
        title: this.data._lang['结束读波形'],
        duration: 3000
      });
    }
  },

  /**菜单列表点击折叠事件回调 */
  onListClick(e) {
    console.log(e.target.name)
    let list = this.data.f_setList;
    try {
      list[e.target.id].show = !list[e.target.id].show

      this.setData({
        f_setList: list,
      })
    } catch (e) {
      console.log(e);
    }
  }
})