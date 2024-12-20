// pages/flow-control/flow-control.js
import {
  w_setList
} from '../../utils/w_setmenu_2'
import {
  translate_radarcom,
} from '../../utils/analysisradardata'
import {
  w_cmdParam
} from '../../utils/w_cmdparam_2'
import {
  buf2int,
  buf2float,
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
    w_setList: w_setList,
    w_setList_tem: w_setList,
    // 雷达信息
    radarInfo_data: {},
    radarInfo_set: {},
    measureResult: '30.000',
    distanceResult: 30.000,
    // 通讯错误
    commError: 0,
    // 蓝牙设备列表
    bleList: [],
    // Lcd曲线
    farRange: 30,
    maxfarRange: 30,
    curveSendTimes: 8,
    new_curveSendTimes: 8,
    lastSendCountPoint: 0,
    cruveStep: 0,
    echo_fft: [],
    echo_tvt: [],
    echo_fft_tem: [],
    echo_tvt_tem: [],
    ble_name: 'Waterlevel',
    ble_name_tem: 'Waterlevel',
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
    timingReadResultInterval: 0,
    timingReadResultFlag: false,
    sendResultQueueObject: {
      'commandSendQueue': [],
      'totalCommandCount': 0,
      'hasSendCommandCount': 0,
    },
    readWaveMaxCount: 7,
    sensorSelfOffset: 0,
    D_R: 0,
    ADCSampleRate: 4000000,
    pointCount: 2048,
    drawCount: 512,
    step: 0.049,
    max_step: 0.049,
    buttonLock: true,
    slaveAddr_tem: 1,
    timeoutResendHandler: null,
  },

  showToast(showString, showTime) {
    wx.showToast({
      title: this.data._lang[showString],
      duration: showTime,
    });
  },

  /** 锁定按钮 防止快速点击导致数据错乱 */
  lockButton() {
    this.setData({
      buttonLock: true,
    });

    setTimeout(()=>{
      this.setData({
        buttonLock: false,
      });
    }, 500);
  },

  /**读取按钮事件回调 */
  onReadcmd(e) {
    let cmd = e.detail;
    let variable = cmd.variable;
    let id = parseInt(cmd.id);
    let id2 = parseInt(cmd.id2);
    var app = getApp();
    
    if (this.data.readWaveFlag)
    {
      this.stopReadEcho();
      this.showToast(this.data._lang['结束读波形'], 1000);
    }

    if (this.data.timingReadResultFlag) {
      this.stopReadResult();
    }

    this.data.sendQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: w_cmdParam.fc_Read2,
      register_addr: w_cmdParam[variable].addr,
      registerCount: w_cmdParam[variable].registerCount,
      type: 'paramRead',
      isRec: false,
      variable: variable,
      id_1: id,
      id_2: id2,
    });

    app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);

    this.lockButton();
  },

  /**设置按钮事件回调 */
  onWritecmd(e) {
    this.lockButton();

    let cmd = e.detail;
    let id = parseInt(cmd.id);
    let id2 = parseInt(cmd.id2);
    let variable = cmd.variable;
    let comData = null;
    var app = getApp();
    let data = 0;

    if (this.data.w_setList[id].items[id2].option)
    {
      let select_num = this.data.w_setList[id].items[id2].option.indexOf(cmd.text);
      if (select_num == -1) {
        select_num = 0;
      }

      comData = {
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Set,
        register_addr: w_cmdParam[variable].addr,
        registerCount: w_cmdParam[variable].registerCount,
        datalen2: w_cmdParam[variable].dataLen,
        data: select_num,
        type: 'paramSet',
        isRec: false,
      };

      this.data.w_setList[id].items[id2].value = cmd.text;
    }
    else
    {
      try {
        switch (this.data.w_setList[id].items[id2].variable) {
          case 'slaveAddr':
            if (Number(cmd.text) > 247) {
              data = NaN;
            } else {
              this.data.slaveAddr_tem = Number(cmd.text);
              data = Number(cmd.text);
            }
            this.data.w_setList[id].items[id2].value = data;
            break;
          case 'continueLoseTime':
            if (Number(cmd.text) >= 1000) {
              data = 1000;
  
              this.data.w_setList[id].items[id2].value = 1000;
            } else {
              data = Number(cmd.text);
  
              this.data.w_setList[id].items[id2].value = Number(cmd.text);
            }
            break;
          case 'feedRate':
          case 'dischargeRate':
            if (Number(cmd.text) >= 300) {
              data = 300 * 100;
              this.data.w_setList[id].items[id2].value = 300;
            } else if (Number(cmd.text) <= 0) {
              data = 0;
              this.data.w_setList[id].items[id2].value = 0;
            } else {
              data = Number(cmd.text) * 100;
              this.data.w_setList[id].items[id2].value = Number(cmd.text);
            }
            break;
          case 'dampingTime':
            if (Number(cmd.text) > 600) {
              data = 600;
  
              this.data.w_setList[id].items[id2].value = 600;
            } else if (Number(cmd.text) < 0) {
              data = 0;
  
              this.data.w_setList[id].items[id2].value = 0;
            } else {
              data = Number(cmd.text);

              this.data.w_setList[id].items[id2].value = Math.floor(data);
            }
            break;
          case 'averageTimes':
            if (Number(cmd.text) > 100) {
              data = 100;
  
              this.data.w_setList[id].items[id2].value = 100;
            } else if (Number(cmd.text) < 1) {
              data = 1;
  
              this.data.w_setList[id].items[id2].value = 1;
            } else {
              data = Number(cmd.text);

              this.data.w_setList[id].items[id2].value = Math.floor(data);
            }
            break;
          case 'measureInterval':
            if (Number(cmd.text) < 100) {
              data = 100;
  
              this.data.w_setList[id].items[id2].value = 100;
            } else {
              data = Number(cmd.text);
              this.data.w_setList[id].items[id2].value = data;
            }
            break;
          case 'thresholdMargin':
            data = this.data.w_setList[id].items[id2].backupValue & 0x00FF | (Number(cmd.text) << 8);
            this.data.w_setList[id].items[id2].backupValue = data;
            this.data.w_setList[id].items[id2].value = Number(cmd.text);
            break;
          case 'bleName':
            this.data.ble_name_tem = cmd.text;
            
            if (cmd.text.length <= 12)
            {
              for (let i=0; i<12-cmd.text.length; i++)
              {
                cmd.text += '\0';
              }
            }
            else
            {
              wx.showToast({
                title: this.data._lang['名称长度超过十二个字符'],
                image: '../../images/error.png',
                duration: 1000
              });
              return;
            }
  
            data = cmd.text;
            this.data.w_setList[id].items[id2].value = cmd.text;
            break;
          case 'blePincode':
            if (cmd.text.length != 6)
            {
              wx.showToast({
                title: this.data._lang['密码长度错误'],
                image: '../../images/error.png',
                duration: 1000
              });
  
              return;
            }
            
            data = cmd.text;

            this.data.w_setList[id].items[id2].value = cmd.text;
            break;
          case 'rangeRange':
            let range = Number(cmd.text);
            if (range > this.data.maxfarRange || range <= 0) {
              range = this.data.maxfarRange;
            }

            this.data.farRange = range;
            this.data.drawCount = this.getDrawCount();
            
            data = range;
  
            this.data.w_setList[id].items[id2].value = range;
            break;
          case 'sensorCorOffset':
            let value = Number(cmd.text).toFixed(3);
  
            if (value < -1) {
              value = -1;
              this.data.w_setList[id].items[id2].value = value;
            } else if (value > 10) {
              value = 10;
  
              this.data.w_setList[id].items[id2].value = value;
            } else {
              this.data.w_setList[id].items[id2].value = value;
            }
  
            data = value;
            break;
          default:
            data = Number(cmd.text);
            this.data.w_setList[id].items[id2].value = cmd.text;
            break;
        } 
      } catch {
        wx.showToast({
          title: this.data._lang['无效值'],
          duration: 1000,
          icon: 'fail',
        });

        return;
      }

      this.setData({
        w_setList: this.data.w_setList,
      });

      if (isNaN(data) && this.data.w_setList[id].items[id2].variable != 'bleName') {
        wx.showToast({
          title: this.data._lang['无效值'],
          duration: 1000,
          image: '../../images/error.png',
        });

        return;
      }

      comData = {
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Set,
        register_addr: w_cmdParam[variable].addr,
        registerCount: w_cmdParam[variable].registerCount,
        datalen2: w_cmdParam[variable].dataLen,
        data: data,
        variable: variable,
        type: 'paramSet',
        isRec: false,
      };
    }

    if (this.data.readWaveFlag)
    {
      this.stopReadEcho();
      this.showToast(this.data._lang['结束读波形'], 1000);
    }

    if (this.data.timingReadResultFlag) {
      this.stopReadResult();
    }

    this.data.sendQueueObject.commandSendQueue.push(comData);

    app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
  },

  /**回复报文解析 */
  modbus_analysis(buffer, name) {
    let result;
    try {
      let d_dataView = new DataView(buffer, 3, w_cmdParam[name].dataLen);
      switch (w_cmdParam[name].dataLen) {
        case 2:
          result = buf2int(d_dataView);
          break;
        case 4:
          result = buf2float(d_dataView);
          break;
        case 6:
        case 12:
        case 16:
          result = '';
          for (let s = 0; s < w_cmdParam[name].dataLen; s += 2) {
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
    } catch(e) {
      console.log(e);
      return NaN;
    }
  },

  /**初始化读参数 将指令推进指令列表 */
  initReadParam() {
    this.data.sendQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: w_cmdParam.fc_Set,
      register_addr: w_cmdParam.bleLogin.addr,
      registerCount: w_cmdParam.bleLogin.registerCount,
      datalen2: w_cmdParam.bleLogin.dataLen,
      data: this.data.loginKey,
      type: 'login',
    });

    w_setList.forEach(elements => {
      elements.items.forEach(element => {
        switch(element.head) {
          case '从机地址':
            this.data.sendQueueObject.commandSendQueue.push({
              radar_addr: 0,
              funcode: w_cmdParam.fc_Read2,
              register_addr: w_cmdParam[element.variable].addr,
              registerCount: w_cmdParam[element.variable].registerCount,
              variable: element.variable,
              id_1: elements.id,
              id_2: element.id,
              type: 'param',
            });
            break;
          default:
            this.data.sendQueueObject.commandSendQueue.push({
              radar_addr: app.globalData.modbus_addr,
              funcode: w_cmdParam.fc_Read2,
              register_addr: w_cmdParam[element.variable].addr,
              registerCount: w_cmdParam[element.variable].registerCount,
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
      funcode: w_cmdParam.fc_Read2,
      register_addr: w_cmdParam.sensorType.addr,
      registerCount: w_cmdParam.sensorType.registerCount,
      datalen2: w_cmdParam.sensorType.dataLen,
      variable: 'sensorType',
      type: 'sensorType',
    });

    this.data.sendQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: w_cmdParam.fc_Read,
      register_addr: w_cmdParam.D_R.addr,
      registerCount: w_cmdParam.D_R.registerCount,
      type: 'midParam',
      paramType: 'D_R',
    });

    this.data.sendQueueObject.commandSendQueue.push({
      radar_addr: app.globalData.modbus_addr,
      funcode: w_cmdParam.fc_Read,
      register_addr: w_cmdParam.sensorSelfOffset.addr,
      registerCount: w_cmdParam.sensorSelfOffset.registerCount,
      type: 'midParam',
      paramType: 'sensorSelfOffset',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.globalData.ble_device.deviceid = options.deviceid;
    app.globalData.modbus_addr = options.modbus_addr;
    app.globalData.ble_device.device_type = '水位计';
    //绑定 接收信息的回调函数
    app.globalData.ble_device.callback_blerec = this.onBleReceive;
    // 绑定 蓝牙 连接 断开信息
    app.globalData.ble_device.callback_bleConnected = this.onBleConnect;
    app.globalData.ble_device.callback_bleDisconnected = this.onBleDisconnect;
    app.globalData.ble_device.callback_bleNotifyState = this.onBleNotifyState;

    let _lang_tem = lang._lang();
    this.data.loginKey = options.key;
    this.setData({
      _lang: _lang_tem,
      ble_name: options.ble_name,
    });

    app.globalData.ble_device.connectBle(options.deviceid);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.stopReadResult();
    app.globalData.ble_device.closeBLEConnection();
    clearInterval(this.data.timeoutResendHandler);
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

  /**计算波形需要的点数 大于15小于30画512个点，小于15画420个点 */
  getDrawCount() {
    let drawCount = 512;

    switch (this.data.maxfarRange) {
      case 15:
        drawCount = 420;

        this.data.readWaveMaxCount = Math.round(drawCount / 64);
        drawCount = drawCount * this.data.farRange / 15;
        break;
      case 30:
        this.data.readWaveMaxCount = Math.round(drawCount / 64);
        if (this.data.farRange <= 18) {
          drawCount = 504 * this.data.farRange / 18;
        }
        break;
      case 60:
        this.data.readWaveMaxCount = Math.round(drawCount / 64);
        if (this.data.farRange <= 33) {
          drawCount = 508 * this.data.farRange / 33;
        }
        break;
      case 120:
        this.data.readWaveMaxCount = Math.round(drawCount / 64);
        if (this.data.farRange <= 66) {
          drawCount = 508 * this.data.farRange / 66;
        }
        break;
      default:
        this.data.readWaveMaxCount = Math.round(drawCount / 64);
        drawCount = drawCount * this.data.farRange / this.data.maxfarRange;
        break;
    }

    return drawCount;
  },

  /**发送命令 */
  send_command(command) {
    app.globalData.ble_device.sendData(translate_radarcom(command), true);
  },

  /**重发 */
  timeout_resend(command) {
    this.send_command(command);

    this.data.timeoutResendHandler = setInterval(() => {
      this.send_command(command);
    }, 500);
  },

  /**发送下一帧 */
  sendNext() {
    this.data.sendQueueObject.commandSendQueue.shift();
    if (this.data.sendQueueObject.commandSendQueue.length != 0) {
      this.timeout_resend(this.data.sendQueueObject.commandSendQueue[0]);
    }
  },

  /**收到报文回调函数 三个分支(1、循环读波形处理；2、定时读水位处理；3、初始化读参数、设置读取参数) */
  onBleReceive(buffer) {
    clearInterval(this.data.timeoutResendHandler);
    if (this.data.readWaveFlag) {
      switch (this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].type) {
        case 'timerParam':
          let v = NaN;
          switch (this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].valueType) {
            case 'queryMeasureResult':
              v = this.modbus_analysis(buffer, 'queryMeasureResult');
              if (v > this.data.maxfarRange) {
                v= NaN;
              }
    
              this.setData({
                measureResult: String(v.toFixed(3)),
              });
              break;
            case 'queryDistanceResult':
              v = this.modbus_analysis(buffer, 'queryDistanceResult');
              if (v > this.data.maxfarRange) {
                v= NaN;
              }
              this.setData({
                distanceResult: String(v.toFixed(3)),
              });
              break;
          }
  
          this.data.sendWaveQueueObject.hasSendCommandCount++;
          break;
        case 'startWave':
          this.data.sendWaveQueueObject.hasSendCommandCount++;
  
          break;
        case 'EchoCurve':
          if (this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id < this.data.readWaveMaxCount) {
            try {
              let d_dataView = new DataView(buffer, 3, w_cmdParam.EchoCurve.list[this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id].registerCount*2);
              for (let i = 0; i < w_cmdParam.EchoCurve.list[this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id].registerCount*2; i += 2) {
                this.data.echo_fft_tem.push(d_dataView.getUint16(i)/500);
              }
            } catch {
              app.globalData.ble_device.sendData(translate_radarcom(this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount]), true);
              break;
            }
          } else {
            switch (this.data.maxfarRange) {
              case 15:
                this.data.echo_fft_tem = this.data.echo_fft_tem.map((p, i) => {
                  return [i * this.data.step, p];
                });
                break;
              case 30:
                if (this.data.farRange <= 18) {
                  this.data.echo_fft_tem = this.data.echo_fft_tem.map((p, i) => {
                    return [i * this.data.step, p];
                  });
                } else {
                  this.data.echo_fft_tem = this.data.echo_fft_tem.map((p, i) => {
                    return [i * this.data.step*2, p];
                  });
                }
                break;
              case 60:
                if (this.data.farRange <= 33) {
                  this.data.echo_fft_tem = this.data.echo_fft_tem.map((p, i) => {
                    return [i * this.data.step, p];
                  });
                } else {
                  this.data.echo_fft_tem = this.data.echo_fft_tem.map((p, i) => {
                    return [i * this.data.step*2, p];
                  });
                }
                break;
              case 120:
                if (this.data.farRange <= 66) {
                  this.data.echo_fft_tem = this.data.echo_fft_tem.map((p, i) => {
                    return [i * this.data.step, p];
                  });
                } else {
                  this.data.echo_fft_tem = this.data.echo_fft_tem.map((p, i) => {
                    return [i * this.data.step*2, p];
                  });
                }
                break;
            }

            this.setData({
              echo_fft: this.data.echo_fft_tem.slice(0, this.data.drawCount),
              echo_fft_tem: [],
            });
          }
  
          this.data.sendWaveQueueObject.hasSendCommandCount++;
          break;
        case 'ThreadholdCurve':
          if (this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id < this.data.readWaveMaxCount) {
            try {
              let d_dataView = new DataView(buffer, 3, w_cmdParam.EchoCurve.list[this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id].registerCount*2);
              for (let i = 0; i < w_cmdParam.EchoCurve.list[this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount].id].registerCount*2; i += 2) {
                this.data.echo_tvt_tem.push(d_dataView.getUint16(i)/500);
              }
            } catch {
              app.globalData.ble_device.sendData(translate_radarcom(this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount]), true);
              break;
            }
          } else {
            switch (this.data.maxfarRange) {
              case 15:
                this.data.echo_tvt_tem = this.data.echo_tvt_tem.map((p, i) => {
                  return [i * this.data.step, p];
                });
                break;
              case 30:
                if (this.data.farRange <= 18) {
                  this.data.echo_tvt_tem = this.data.echo_tvt_tem.map((p, i) => {
                    return [i * this.data.step, p];
                  });
                } else {
                  this.data.echo_tvt_tem = this.data.echo_tvt_tem.map((p, i) => {
                    return [i * this.data.step*2, p];
                  });
                }
                break;
              case 60:
                if (this.data.farRange <= 33) {
                  this.data.echo_tvt_tem = this.data.echo_tvt_tem.map((p, i) => {
                    return [i * this.data.step, p];
                  });
                } else {
                  this.data.echo_tvt_tem = this.data.echo_tvt_tem.map((p, i) => {
                    return [i * this.data.step*2, p];
                  });
                }
                break;
              case 120:
                if (this.data.farRange <= 66) {
                  this.data.echo_tvt_tem = this.data.echo_tvt_tem.map((p, i) => {
                    return [i * this.data.step, p];
                  });
                } else {
                  this.data.echo_tvt_tem = this.data.echo_tvt_tem.map((p, i) => {
                    return [i * this.data.step*2, p];
                  });
                }
                break;
            }
            
            this.setData({
              echo_tvt: this.data.echo_tvt_tem.slice(0, this.data.drawCount),
              echo_tvt_tem: [],
            });
          }
  
          this.data.sendWaveQueueObject.hasSendCommandCount++;

          if (this.data.sendWaveQueueObject.hasSendCommandCount == this.data.sendWaveQueueObject.totalCommandCount) {
            this.data.sendWaveQueueObject.hasSendCommandCount = 0;
          }
          break;
      }
      this.timeout_resend(this.data.sendWaveQueueObject.commandSendQueue[this.data.sendWaveQueueObject.hasSendCommandCount]);
    } else if (this.data.timingReadResultFlag) {
      if (!this.data.buttonLock) {
        switch (this.data.sendResultQueueObject.commandSendQueue[0].type) {
          case 'waterLevelResult':
            let v = this.modbus_analysis(buffer, 'queryMeasureResult');
            if (v > this.data.maxfarRange) {
              v= NaN;
            }
  
            this.setData({
              measureResult: String(v.toFixed(3)),
            });
            break;
        }
      }
    } else {
      try {
        switch (this.data.sendQueueObject.commandSendQueue[0].type) {
          case 'sensorType':
            let sensorType = this.modbus_analysis(buffer, this.data.sendQueueObject.commandSendQueue[0].variable);

            switch (sensorType[4]) {
              case '0': //60m
                this.data.maxfarRange = 60;
                break;
              case '1': //30m
                this.data.maxfarRange = 30;
                break;
              case '2': //120m
                this.data.maxfarRange = 120;
                break;
              case '3': //15m
                this.data.maxfarRange = 15;
                break;
              default:
                break;
            }

            this.sendNext();
            break;

          case 'login':
            this.onBLELoginBack(true);
            this.data.sendQueueObject.commandSendQueue.shift();
            if (this.data.sendQueueObject.commandSendQueue.length != 0) {
              app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
            }
            break;

          case 'param':
            let id_1 = this.data.sendQueueObject.commandSendQueue[0].id_1;
            let id_2 = this.data.sendQueueObject.commandSendQueue[0].id_2;
            let value = this.modbus_analysis(buffer, this.data.sendQueueObject.commandSendQueue[0].variable);
  
            /**中间变量处理 */
            switch (this.data.sendQueueObject.commandSendQueue[0].variable) {
              case 'rangeRange':
                this.data.farRange = value;
                break;
              case 'slaveAddr':
                if (value != app.globalData.modbus_addr) {
                  app.globalData.modbus_addr = value;
                  this.data.sendWaveQueueObject.commandSendQueue.forEach(element => {
                    element.radar_addr = value;
                  });
                  this.data.sendQueueObject.commandSendQueue.forEach(element => {
                    element.radar_addr = value;
                  });
                  this.data.sendResultQueueObject.commandSendQueue.forEach(element => {
                    element.radar_addr = value;
                  })
                }
                break;
            }
            
            /**输入框类型处理 */
            switch (this.data.w_setList[id_1].items[id_2].type) {
              case "text":
                /**显示处理 */
                switch (this.data.sendQueueObject.commandSendQueue[0].variable) {
                  case 'rangeRange':
                  case 'blindAreaRange':
                  case 'highAdjustment':
                  case 'lowAdjustment':
                  case 'sensorCorOffset':
                    value = value.toFixed(3);
                    this.data.w_setList[id_1].items[id_2].value = String(value);
                    break;
                  case 'thresholdMargin':
                    this.data.w_setList[id_1].items[id_2].backupValue = value;
                    value = value >> 8;
                    this.data.w_setList[id_1].items[id_2].value = String(value);
                    break;
                  case 'feedRate':
                  case 'dischargeRate':
                    this.data.w_setList[id_1].items[id_2].value = value/100;
                    break;
                  case 'bleName':
                    value = String(value).replaceAll(' ', '');
                    this.data.w_setList[id_1].items[id_2].value = value;
                    break;
                  default:
                    this.data.w_setList[id_1].items[id_2].value = String(value);
                    break;
                }
                break;
              
              case "select":
                if (value > this.data.w_setList[id_1].items[id_2].option.length) {
                  this.data.w_setList[id_1].items[id_2].value = value
                } else {
                  this.data.w_setList[id_1].items[id_2].value = this.data.w_setList[id_1].items[id_2].option[value];
                }
                break;
            }
    
            this.setData({
              w_setList: this.data.w_setList,
            });
    
            this.sendNext();
            break;
    
          case 'midParam':
            switch (this.data.sendQueueObject.commandSendQueue[0].paramType) {
              case 'D_R':
                this.data.D_R = this.modbus_analysis(buffer, 'D_R');
                break;
              case 'sensorSelfOffset':
                this.data.sensorOffset = this.modbus_analysis(buffer, 'sensorSelfOffset');
                this.data.step = parseFloat(((this.data.D_R*this.data.ADCSampleRate) / this.data.pointCount).toFixed(7));
                this.data.max_step = parseFloat(((this.data.D_R*this.data.ADCSampleRate) / this.data.pointCount).toFixed(7));
                
                this.data.drawCount = this.getDrawCount();

                this.showToast(this.data._lang["初始化读参数成功"], 1000);
                this.initWaveQueue();
                this.initResultQueue();
                this.startReadResult();
                this.setData({
                  buttonLock: false,
                });
                break;
            }
    
            this.sendNext();
            break;
  
          case 'paramRead':
            if (this.data.sendQueueObject.commandSendQueue[0].isRec) {
              let id_1 = this.data.sendQueueObject.commandSendQueue[0].id_1;
              let id_2 = this.data.sendQueueObject.commandSendQueue[0].id_2;
              let value = this.modbus_analysis(buffer, this.data.sendQueueObject.commandSendQueue[0].variable);
  
              switch (this.data.sendQueueObject.commandSendQueue[0].variable) {
                case 'rangeRange':
                  this.data.farRange = value;
                  break;
                case 'slaveAddr':
                  if (value != app.globalData.modbus_addr) {
                    app.globalData.modbus_addr = value;
                    this.data.sendWaveQueueObject.commandSendQueue.forEach(element => {
                      element.radar_addr = value;
                    });

                    this.data.sendQueueObject.commandSendQueue.forEach(element => {
                      element.radar_addr = value;
                    });

                    this.data.sendResultQueueObject.commandSendQueue.forEach(element => {
                      element.radar_addr = value;
                    });
                  }
                  break;
              }
      
              switch (this.data.w_setList[id_1].items[id_2].type) {
                case "text":
                  switch (this.data.sendQueueObject.commandSendQueue[0].variable) {
                    case 'rangeRange':
                    case 'blindAreaRange':
                    case 'highAdjustment':
                    case 'lowAdjustment':
                    case 'sensorCorOffset':
                      value = value.toFixed(3);
                      this.data.w_setList[id_1].items[id_2].value = String(value);
                      break;
                    case 'thresholdMargin':
                      this.data.w_setList[id_1].items[id_2].backupValue = value;
                      value = value >> 8;
                      this.data.w_setList[id_1].items[id_2].value = String(value);
                      break;
                    case 'feedRate':
                    case 'dischargeRate':
                      this.data.w_setList[id_1].items[id_2].value = value/100;
                      break;
                    case 'bleName':
                      value = String(value).replaceAll(' ', '');
                      this.data.w_setList[id_1].items[id_2].value = value;
                      break;
                    default:
                      this.data.w_setList[id_1].items[id_2].value = String(value);
                  }
                  break;
                
                case "select":
                  if (value > this.data.w_setList[id_1].items[id_2].option.length) {
                    this.data.w_setList[id_1].items[id_2].value = value
                  } else {
                    this.data.w_setList[id_1].items[id_2].value = this.data.w_setList[id_1].items[id_2].option[value];
                  }
                  break;
              }
      
              this.setData({
                w_setList: this.data.w_setList,
              });
  
              this.sendNext();
  
              wx.showToast({
                title: this.data._lang['读取成功'],
                icon: 'success',
                duration: 500,
              });

              this.startReadResult();
            } else {
              app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
              this.data.sendQueueObject.commandSendQueue[0].isRec = true;
            }
            break;
  
          case 'paramSet':
            if (this.data.sendQueueObject.commandSendQueue[0].isRec) {
              if (this.data.sendQueueObject.commandSendQueue[0].variable == 'bleName') {
                this.setData({
                  ble_name: this.data.ble_name_tem,
                })
              } else if (this.data.sendQueueObject.commandSendQueue[0].variable == 'slaveAddr') {
                app.globalData.modbus_addr = this.data.slaveAddr_tem;
                this.data.sendWaveQueueObject.commandSendQueue.forEach(element => {
                  element.radar_addr = this.data.slaveAddr_tem;
                });

                this.data.sendResultQueueObject.commandSendQueue.forEach(element => {
                  element.radar_addr = this.data.slaveAddr_tem;
                });

                this.data.sendQueueObject.commandSendQueue.forEach(element => {
                  element.radar_addr = this.data.slaveAddr_tem;
                });
              }
              
              this.sendNext();

              wx.showToast({
                title: this.data._lang['设置成功'],
                icon: 'success',
                duration: 500,
              });

              this.startReadResult();
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
      } catch(e) {
        this.sendNext();
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
      wx.showModal({
        title: this.data._lang['蓝牙已断开'],
        image: '../../images/error.png',
        content: '',
        success: function(res) {
        }
      });

      this.stopReadResult();
      clearInterval(this.data.timeoutResendHandler);
      wx.navigateBack({
        delta: 1
      });
    }
  },

  /**登录蓝牙函数发送指定报文到水位计蓝牙板 */
  loginBLE() {
    app.globalData.ble_device.w_sendData(translate_radarcom({
      radar_addr: app.globalData.modbus_addr,
      funcode: w_cmdParam.fc_Set,
      register_addr: w_cmdParam.bleLogin.addr,
      registerCount: w_cmdParam.bleLogin.registerCount,
      datalen2: w_cmdParam.bleLogin.dataLen,
      data: this.data.loginKey,
    }), app.globalData.ble_device.seruuid, app.globalData.ble_device.charuuid);

    this.onBLELoginBack(true);
    
    this.initReadParam();
    this.showToast(this.data._lang["开始初始化读参数"], 1000);
    app.globalData.ble_device.sendData(translate_radarcom(this.data.sendQueueObject.commandSendQueue[0]), true);
  },

  /**蓝牙notify状态改变回调 */
  onBleNotifyState() {
    if (this.data.bleNotifyState == false) {
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
    // add read water level
    this.data.sendWaveQueueObject.commandSendQueue.push(
      {
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Read,
        register_addr: w_cmdParam.queryMeasureResult.addr,
        registerCount: w_cmdParam.queryMeasureResult.registerCount,
        type: 'timerParam',
        valueType: 'queryMeasureResult'
      }
    );

    this.data.sendWaveQueueObject.commandSendQueue.push(
      {
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Read,
        register_addr: w_cmdParam.queryDistanceResult.addr,
        registerCount: w_cmdParam.queryDistanceResult.registerCount,
        type: 'timerParam',
        valueType: 'queryDistanceResult'
      }
    );

    // add read wave start
    this.data.sendWaveQueueObject.commandSendQueue.push(
      {
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Set,
        register_addr: w_cmdParam.uploadWave.addr,
        registerCount: w_cmdParam.uploadWave.registerCount,
        datalen2: w_cmdParam.uploadWave.dataLen,
        type: 'startWave',
        data: w_cmdParam.uploadWave.start,
      }
    );

    this.data.sendWaveQueueObject.commandSendQueue.push(
      {
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Set,
        register_addr: w_cmdParam.uploadWave.addr,
        registerCount: w_cmdParam.uploadWave.registerCount,
        datalen2: w_cmdParam.uploadWave.dataLen,
        type: 'startWave',
        data: w_cmdParam.uploadWave.start_2,
      }
    );

    this.data.sendWaveQueueObject.totalCommandCount += 4;

    // add wave
    for (let i=0; i<=this.data.readWaveMaxCount; i++) {
      this.data.sendWaveQueueObject.commandSendQueue.push(
        {
          radar_addr: app.globalData.modbus_addr,
          funcode: w_cmdParam.fc_Read,
          register_addr: w_cmdParam.EchoCurve.addr + i * 64,
          registerCount: 64,
          type: 'EchoCurve',
          id: i,
        }
      );

      this.data.sendWaveQueueObject.totalCommandCount++;
    }

    for (let i=0; i<=this.data.readWaveMaxCount; i++) {
      this.data.sendWaveQueueObject.commandSendQueue.push(
        {
          radar_addr: app.globalData.modbus_addr,
          funcode: w_cmdParam.fc_Read,
          register_addr: w_cmdParam.ThreadholdCurve.addr + i * 64,
          registerCount: 64,
          type: 'ThreadholdCurve',
          id: i,
        }
      );

      this.data.sendWaveQueueObject.totalCommandCount++;
    }
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

  /**初始化定时读水位队列，将读水位指令添加进定时队列中 */
  initResultQueue() {
    // add read water level
    this.data.sendResultQueueObject.commandSendQueue.push(
      {
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Read,
        register_addr: w_cmdParam.queryMeasureResult.addr,
        registerCount: w_cmdParam.queryMeasureResult.registerCount,
        type: 'waterLevelResult',
      }
    );
  },

  /**开始定时读水位 */
  startReadResult() {
    this.data.timingReadResultFlag = true;

    this.data.timingReadResultInterval = setInterval(() => {
      app.globalData.ble_device.sendData(translate_radarcom(this.data.sendResultQueueObject.commandSendQueue[0]), true);
    }, 5000);
  },

  /**停止定时读水位 */
  stopReadResult() {
    clearInterval(this.data.timingReadResultInterval);
    this.data.timingReadResultFlag = false;
  },

  /**开始读波形点击事件回调 */
  onChartClick(e) {
    if (!this.data.readWaveFlag) {
      if (this.data.timingReadResultFlag) {
        this.stopReadResult();
      }

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
      });

      wx.showToast({
        title: this.data._lang['结束读波形'],
        duration: 1500
      });

      this.startReadResult();
    }
  },

  /**菜单列表点击折叠事件回调 */
  onListClick(e) {
    console.log(e.target.name)
    let list = this.data.w_setList;
    try {
      list[e.target.id].show = !list[e.target.id].show
      this.setData({
        w_setList: list,
      })
    } catch (e) {
      console.log(e);
    }
  }
})
