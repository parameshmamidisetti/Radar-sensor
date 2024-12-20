// pages/index/index.js

import {
  w_setList
} from '../../utils/w_setmenu'
import {
  w_cmdParam
} from '../../utils/w_cmdparam'
import {
  buf2int,
  buf2float,
  buf2str
} from '../../utils/analysisradardata'

var lang = require('../../utils/languageUtils');
  
var app = getApp();
var RADARADDR = null;
var pointCount = 2048;
var maxFarRange = 36;

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
        water_setList: w_setList,
        // 雷达信息
        radarInfo_data: {},
        radarInfo_set: {},
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
        tem_l_lcd_fft: [],
        tem_l_lcd_tvt: [],
        l_lcd_fft: [],
        l_lcd_tvt: [],
        ble_name: '',
        DR: null,
        ADCSampleRate: null,
        sensorSelfOffset: null,
        // 是否开启远程协助功能
        remoteAssistance: true,
        // 远程协助RemoteId remotepk url
        remoteId: 'eBJRCEEDpm42erAebr6WGpS8GEDBnSNC',
        // remoteId: 'r2QADxjcJkkXthi7yTGpWyi5RCxnyfka',
        remotePk: 'temp',
        url: 'wss://wdxc-micro.com/wss',
        assistanceData: null,
        remoteAssistanceStatus: false,
        currentSenID: null,
        showBaseList: false,
        showBleList: false,
        _lang: lang._lang(),
        w_setList: w_setList,
        modbus_addr: 0x01,
        buttonLock: false,
    },

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

    reConnect() {
      app.globalData.rad_com.connectBle(this.data.bleInfo.deviceid);
    },
    
    onReadCmd(e) {
      let cmd = e.detail;
      let id = parseInt(cmd.id);
      var app = getApp();

      let comData = {
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Read2,
        register_addr: w_cmdParam[w_setList[id].variable].addr,
        registerCount: w_cmdParam[w_setList[id].variable].registerCount,
        cmdType: 'isDirectSend',
        directType: 'read',
      }
      this.data.currentSenID = id;
      
      app.globalData.rad_com.cmdList.splice(1, 0, comData);
      this.lockButton();
    },

    // 接收设置参数信息
    onSetCmd(e) {
      let cmd = e.detail;
      let id = parseInt(cmd.id);
      let comData = null;
      var app = getApp();

      if (w_setList[id].option)
      {
        let select_num = 0;
        for (let i=0; i<w_setList[id].option.length; i++)
        {
          if (this.data._lang[w_setList[id].option[i]] == cmd.text)
          {
            select_num = i;
            break;
          }
        }

        comData = {
          radar_addr: app.globalData.modbus_addr,
          funcode: w_cmdParam.fc_Set,
          register_addr: w_cmdParam[w_setList[id].variable].addr,
          registerCount: w_cmdParam[w_setList[id].variable].registerCount,
          datalen2: w_cmdParam[w_setList[id].variable].dataLen,
          data: select_num,
          cmdType: 'isDirectSend',
          directType: 'set',
          id: id,
        }
      }
      else
      {
        if (w_setList[id].head.indexOf('蓝牙名称') != -1)
        {
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
              title: '名称长度超过十二个字符',
              image: '../../images/error.png',
              duration: 1000
            });
            return;
          }

          comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: w_cmdParam.fc_Set,
            register_addr: w_cmdParam[w_setList[id].variable].addr,
            registerCount: w_cmdParam[w_setList[id].variable].registerCount,
            datalen2: w_cmdParam[w_setList[id].variable].dataLen,
            data: cmd.text,
            cmdType: 'isDirectSend',
            directType: 'set',
            id: id,
          }
        }
        else if (w_setList[id].head.indexOf('蓝牙密码') != -1)
        {
          if (cmd.text.length != 6)
          {
            wx.showToast({
              title: _lang['密码长度错误'],
              image: '../../images/error.png',
              duration: 1000
            });

            return;
          }
          comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: w_cmdParam.fc_Set,
            register_addr: w_cmdParam[w_setList[id].variable].addr,
            registerCount: w_cmdParam[w_setList[id].variable].registerCount,
            datalen2: w_cmdParam[w_setList[id].variable].dataLen,
            data: cmd.text,
            cmdType: 'isDirectSend',
            directType: 'set',
            id: id,
          }
        }
        else
        {
          switch (true)
          {
            case w_setList[id].head.indexOf('进料速率') != -1:
              comData = {
                radar_addr: app.globalData.modbus_addr,
                funcode: w_cmdParam.fc_Set,
                register_addr: w_cmdParam[w_setList[id].variable].addr,
                registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                data: Number(cmd.text)*100,
                cmdType: 'isDirectSend',
                directType: 'set',
                id: id,
              }
              break;
            case w_setList[id].head.indexOf('出料速率') != -1:
              comData = {
                radar_addr: app.globalData.modbus_addr,
                funcode: w_cmdParam.fc_Set,
                register_addr: w_cmdParam[w_setList[id].variable].addr,
                registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                data: Number(cmd.text)*100,
                cmdType: 'isDirectSend',
                directType: 'set',
                id: id,
              }
              break;
            case w_setList[id].head.indexOf('阻尼滤波') != -1:
              if (Number(cmd.text) > 600)
              {
                comData = {
                  radar_addr: app.globalData.modbus_addr,
                  funcode: w_cmdParam.fc_Set,
                  register_addr: w_cmdParam[w_setList[id].variable].addr,
                  registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                  datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                  data: 600,
                  cmdType: 'isDirectSend',
                  directType: 'set',
                  id: id,
                }
              }
              else if (Number(cmd.text) < 0)
              {
                comData = {
                  radar_addr: app.globalData.modbus_addr,
                  funcode: w_cmdParam.fc_Set,
                  register_addr: w_cmdParam[w_setList[id].variable].addr,
                  registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                  datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                  data: 0,
                  cmdType: 'isDirectSend',
                  directType: 'set',
                  id: id,
                }
              }
              else
              {
                comData = {
                  radar_addr: app.globalData.modbus_addr,
                  funcode: w_cmdParam.fc_Set,
                  register_addr: w_cmdParam[w_setList[id].variable].addr,
                  registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                  datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                  data: Number(cmd.text),
                  cmdType: 'isDirectSend',
                  directType: 'set',
                  id: id,
                }
              }
              break;
            case w_setList[id].head.indexOf('平均次数') != -1:
              if (Number(cmd.text) > 100)
              {
                comData = {
                  radar_addr: app.globalData.modbus_addr,
                  funcode: w_cmdParam.fc_Set,
                  register_addr: w_cmdParam[w_setList[id].variable].addr,
                  registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                  datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                  data: 100,
                  cmdType: 'isDirectSend',
                  directType: 'set',
                  id: id,
                }
              }
              else if (Number(cmd.text) < 1)
              {
                comData = {
                  radar_addr: app.globalData.modbus_addr,
                  funcode: w_cmdParam.fc_Set,
                  register_addr: w_cmdParam[w_setList[id].variable].addr,
                  registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                  datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                  data: 1,
                  cmdType: 'isDirectSend',
                  directType: 'set',
                  id: id,
                }
              }
              else
              {
                comData = {
                  radar_addr: app.globalData.modbus_addr,
                  funcode: w_cmdParam.fc_Set,
                  register_addr: w_cmdParam[w_setList[id].variable].addr,
                  registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                  datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                  data: Number(cmd.text),
                  cmdType: 'isDirectSend',
                  directType: 'set',
                  id: id,
                }
              }
              break;
            case w_setList[id].head.indexOf('测量时间间隔') != -1:
              if (Number(cmd.text) < 100)
              {
                comData = {
                  radar_addr: app.globalData.modbus_addr,
                  funcode: w_cmdParam.fc_Set,
                  register_addr: w_cmdParam[w_setList[id].variable].addr,
                  registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                  datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                  data: 100,
                  cmdType: 'isDirectSend',
                  directType: 'set',
                  id: id,
                }
              }
              else
              {
                comData = {
                  radar_addr: app.globalData.modbus_addr,
                  funcode: w_cmdParam.fc_Set,
                  register_addr: w_cmdParam[w_setList[id].variable].addr,
                  registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                  datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                  data: Number(cmd.text),
                  cmdType: 'isDirectSend',
                  directType: 'set',
                  id: id,
                }
              }
              break;
            case w_setList[id].head.indexOf('阈值余量') != -1:
              let data_tem = Number(cmd.text) << 8;
              comData = {
                radar_addr: app.globalData.modbus_addr,
                funcode: w_cmdParam.fc_Set,
                register_addr: w_cmdParam[w_setList[id].variable].addr,
                registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                data: data_tem,
                cmdType: 'isDirectSend',
                directType: 'set',
                id: id,
              }
              break;
            default:
              comData = {
                radar_addr: app.globalData.modbus_addr,
                funcode: w_cmdParam.fc_Set,
                register_addr: w_cmdParam[w_setList[id].variable].addr,
                registerCount: w_cmdParam[w_setList[id].variable].registerCount,
                datalen2: w_cmdParam[w_setList[id].variable].dataLen,
                data: Number(cmd.text),
                cmdType: 'isDirectSend',
                directType: 'set',
                id: id,
              }
              break;
          }
        }
      }
      comData.is_set = true;

      if (id == 11)
      {
        this.data.farRange = Number(cmd.text);
      }
      
      this.data.currentSenID = id;
      
      app.globalData.rad_com.cmdList.splice(1, 0, comData);
      this.lockButton();
    },

    onUpdateWaterLevel(buffer) {
      let dataView = new DataView(buffer, 3, w_cmdParam.queryMeasureResult.dataLen);
      let v = null;
      let info = {};

      v = buf2float(dataView);
      this.data.radarInfo_data.waterLevel = v;

      this.setData({
        radarInfo_data: this.data.radarInfo_data,
      })
    },

    onUpdateEcho(buffer, id, lastFrame) {
      let current_len = this.data.tem_l_lcd_fft.length;
      let dataView = new DataView(buffer);
      let len = dataView.getUint8(2);
      
      if (current_len <= 0 || id == current_len/64)
      {
        let d_dataView = new DataView(buffer, 3, len);
        for (let i = 0; i < len; i += 2) {
          this.data.tem_l_lcd_fft.push(d_dataView.getUint16(i)/500);
        }
      }
      
      if (lastFrame)
      {
        let fft = [];
        let step = 1;
        if (this.data.tem_l_lcd_fft.length > 1000) {
          step = 2;
        }
        for (let i=0,j=0; i<this.data.tem_l_lcd_fft.length; i+=step,j++) {
          fft.push([j * this.data.step, this.data.tem_l_lcd_fft[i]]);
        }

        this.setData({
          l_lcd_fft: fft,
        });

        this.data.tem_l_lcd_fft = [];
      }
    },

    onUpdateThreadhold(buffer, id, lastFrame) {
      let current_len = this.data.tem_l_lcd_tvt.length;
      let dataView = new DataView(buffer);
      let len = dataView.getUint8(2);

      if (current_len <= 0 || id == current_len/64)
      {
        let d_dataView = new DataView(buffer, 3, len);
        for (let i = 0; i < len; i += 2) {
          this.data.tem_l_lcd_tvt.push(d_dataView.getUint16(i)/500);
        }
      }
      
      if (lastFrame)
      {
        let tvt = [];
        let step = 1;
        if (this.data.tem_l_lcd_tvt.length > 1000) {
          step = 2;
        }

        for (let i=0,j=0; i<this.data.tem_l_lcd_tvt.length; i+=step,j++) {
          tvt.push([j * this.data.step, this.data.tem_l_lcd_tvt[i]]);
        }

        this.setData({
          l_lcd_tvt: tvt,
        });
        
        this.data.tem_l_lcd_tvt = [];
      }
    },

    onDirectSetUpdate(id) {
      if (id == 11)
      {
        let drawCount;
        if (v > 15 && v <= 30) {
          drawCount = 512;
        } else if (v <= 15) {
          drawCount = 420;
        } else {
          drawCount = (this.data.farRange+this.data.sensorSelfOffset) * pointCount / (this.data.DR*this.data.ADCSampleRate)*2;
        }
        
        let sendTime = parseInt(drawCount / 64);
        this.data.curveSendTimes = sendTime;
        app.globalData.rad_com.curveSendTimes = sendTime;
        app.globalData.rad_com.lastSendCountPoint = drawCount % 64;
      }

      wx.showToast({
        title: this.data._lang['设置成功'],
        icon: 'success',
        duration: 500,
      });
    },
    
    onDirectSendUpdate(buffer) {
      let v = null;
      let tem = this.data.water_setList;
      let current_id = this.data.currentSenID;
      
      let d_dataView = new DataView(buffer, 3, w_cmdParam[tem[current_id].variable].dataLen);
      if (w_cmdParam[tem[current_id].variable].dataLen == 2)
      {
        if (tem[current_id].head == '阈值余量')
        {
          v = d_dataView.getInt8(0);
        }
        else
        {
          v = buf2int(d_dataView);
          if (tem[current_id].head.indexOf('料速率') != -1)
          {
            v = v / 100;
          }
        }
      } else if (w_cmdParam[tem[current_id].variable].dataLen == 4) {
        v = buf2float(d_dataView);
      } else if (tem[current_id].head.indexOf('蓝牙名称') != -1 || tem[current_id].head.indexOf('蓝牙密码') != -1)
      {
        v = '';
        for (let s = 0; s < w_cmdParam[tem[current_id].variable].dataLen; s += 2) {
          let c1 = d_dataView.getUint8(s + 1)
          if (c1 < 32 || c1 > 126) {
            c1 = 32; //不可见字符转为空格
          }
          let c2 = d_dataView.getUint8(s)
          if (c2 < 32 || c2 > 126) {
            c2 = 32; //不可见字符转为空格
          }
          if (c2 != 32) {
            v += String.fromCharCode(c2);
            v += String.fromCharCode(c1);
          }
        }
      }

      if (tem[current_id].option)
      {
        tem[current_id].value = tem[current_id].option[v];
      } else {
        tem[current_id].value = v;
      }
      
      this.setData({
        water_setList: tem,
      });

      wx.showToast({
        title: this.data._lang['读取成功'],
        icon: 'success',
        duration: 500,
      });
    },

    onInitInfoUpdate(buffer, id) {
      let v = null;
      let tem = this.data.water_setList;
      
      let d_dataView = new DataView(buffer, 3, w_cmdParam[tem[id].variable].dataLen);
      if (w_cmdParam[tem[id].variable].dataLen == 2)
      {
        if (tem[id].head == '阈值余量')
        {
          v = d_dataView.getInt8(0);
        }
        else
        {
          v = buf2int(d_dataView);
        }
        
        if (tem[id].head.indexOf('料速率') != -1)
        {
          v = v/100;
        }

      } else if (w_cmdParam[tem[id].variable].dataLen == 4) {
        v = buf2float(d_dataView);
      }

      if (tem[id].head.indexOf('量程设定') != -1)
      {
        this.data.farRange = v;
        let drawCount;
        if (v > 15 && v <= 30) {
          drawCount = 511;
        } else if (v <= 15) {
          drawCount = 420;
        } else {
          drawCount = (this.data.farRange+this.data.sensorSelfOffset) * pointCount / (this.data.DR*this.data.ADCSampleRate)*2;
        }
        
        let sendTime = parseInt(drawCount / 64);
        this.data.curveSendTimes = sendTime;
        app.globalData.rad_com.curveSendTimes = sendTime;
        app.globalData.rad_com.lastSendCountPoint = drawCount % 64;
        this.data.step = (this.data.DR*this.data.ADCSampleRate) / pointCount;
      }

      if (tem[id].head.indexOf('蓝牙名称') != -1)
      {
        v = '';
        for (let s = 0; s < w_cmdParam[tem[id].variable].dataLen; s += 2) {
          let c1 = d_dataView.getUint8(s + 1)
          if (c1 < 32 || c1 > 126) {
            c1 = 32; //不可见字符转为空格
          }
          let c2 = d_dataView.getUint8(s)
          if (c2 < 32 || c2 > 126) {
            c2 = 32; //不可见字符转为空格
          }
          v += String.fromCharCode(c2);
          v += String.fromCharCode(c1);
        }
      }

      if (tem[id].head.indexOf('蓝牙密码') != -1)
      {
        v = '';
        for (let s = 0; s < w_cmdParam[tem[id].variable].dataLen; s += 2) {
          let c1 = d_dataView.getUint8(s + 1)
          if (c1 < 32 || c1 > 126) {
            c1 = 32; //不可见字符转为空格
          }
          let c2 = d_dataView.getUint8(s)
          if (c2 < 32 || c2 > 126) {
            c2 = 32; //不可见字符转为空格
          }
          v += String.fromCharCode(c2);
          v += String.fromCharCode(c1);
        }
      }

      if (tem[id].option)
      {
        if (v > tem[id].option.length)
        {
          tem[id].value = v;
        }
        else
        {
          tem[id].value = tem[id].option[v];
        }
      } else {
        tem[id].value = v;
      }
      
      this.setData({
        water_setList: tem,
      });
    },

    onGetDR(buffer) {
      let v = null;
      let d_dataView = new DataView(buffer, 3, w_cmdParam.D_R.dataLen);

      v = buf2float(d_dataView);
      
      this.data.DR = v;
    },

    onGetADCSampleRate(buffer) {
      let v = null;
      let d_dataView = new DataView(buffer, 3, w_cmdParam.ADCSampleRate.dataLen);

      v = buf2float(d_dataView);

      this.data.ADCSampleRate = 4000000;
    },

    onGetSensorSelfOffset(buffer) {
      let v = null;
      let d_dataView = new DataView(buffer, 3, w_cmdParam.ADCSampleRate.dataLen);

      v = buf2float(d_dataView);

      this.data.sensorSelfOffset = v;
    },

    onGetDeviceSN(buffer) {
      let sn = buffer[5];
      sn >>= 2;
      sn &= 3;
    },

    // 接收雷达信息更新 更新界面
    onUpdateRadarInfo(radarInfo) {
        switch (radarInfo.dataType) {
          case 'radarInfo':
              this.setData({
                radarInfo_set: radarInfo,
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
                step = parseFloat((radarInfo.farRange / 512).toFixed(3));
              } else {
                return;
              }
              if (radarInfo.lcd_echoCurve) {
                fft = radarInfo.lcd_echoCurve.map((p, i) => {
                    return [i * step, p];
                });
                this.setData({
                    l_lcd_fft: fft,
                });
              }
              if (radarInfo.lcd_TVTModifyCurve) {
                tvt = radarInfo.lcd_TVTModifyCurve.map((p, i) => {
                    return [i * step, p];
                });
                this.setData({
                    l_lcd_tvt: tvt,
                });
              }
              this.setData({
                radarInfo_set: radarInfo,
                radarInfo_data: radarInfo
              });

              break;
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
      
      wx.showModal({
        title: this.data._lang['蓝牙已断开'],
        image: '../../images/error.png',
        content: '',
        success: function(res) {
        }
      })

      app.globalData.rad_com.clearcomlist(1);
    },

    // 登录状态变化
    onLoginStateChange(flag) {
        this.setData({
        loggedIn: flag
        })
    },

    displayChange(e) {
      console.log(e.target);
      if (e.target.id == "base_menu") {
        this.setData({
          showBaseList: !this.data.showBaseList
        });
      } else {
        this.setData({
          showBleList: !this.data.showBleList
        });
      }
      
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      // 雷达 实例化 初始化
      var app = getApp();

      app.globalData.rad_com.device_type = '水位计';
      app.globalData.rad_com.bleUUID = this.data.bleInfo.deviceid;
      app.globalData.rad_com.loginKey = this.data.loginKey;
      app.globalData.rad_com.callback_directSetRec = this.onDirectSetUpdate;
      app.globalData.rad_com.callback_initGetSensorSelfOffset = this.onGetSensorSelfOffset;
      app.globalData.rad_com.callback_initGetDeviceSN = this.onGetDeviceSN;
      app.globalData.rad_com.callback_updateWaterLevel = this.onUpdateWaterLevel;
      app.globalData.rad_com.modbus_addr = app.globalData.modbus_addr;
      app.globalData.rad_com.callback_updateEcho = this.onUpdateEcho;
      app.globalData.rad_com.callback_updateThreadhold = this.onUpdateThreadhold;
      app.globalData.rad_com.callback_initGetDR = this.onGetDR;
      app.globalData.rad_com.callback_initGetADCSampleRate = this.onGetADCSampleRate;
      app.globalData.rad_com.callback_updateRadarInfo = this.onUpdateRadarInfo;
      app.globalData.rad_com.callback_bleDisconnected = this.onbleDisconnected;
      app.globalData.rad_com.callback_bleConnected = this.onbleConnected;
      app.globalData.rad_com.callback_bleLoginStateChange = this.onLoginStateChange;
      app.globalData.rad_com.callback_blerec = this.on2RemoteAssistanceData;
      app.globalData.rad_com.callback_directSendRec = this.onDirectSendUpdate;
      app.globalData.rad_com.callback_initInfoRec = this.onInitInfoUpdate;
      // 赋值登录密码
      app.globalData.rad_com.loginKey = options.key;
      this.setData({
          ble_name: options.ble_name,
          modbus_addr: options.modbus_addr,
      });
    
      app.globalData.rad_com.init();

      app.globalData.rad_com.connectBle(options.deviceid);

      app.globalData.rad_com.add2cmdList({
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Read,
        register_addr: w_cmdParam.D_R.addr,
        registerCount: w_cmdParam.D_R.registerCount,
        cmdType: 'isGetDR',
      });

      app.globalData.rad_com.add2cmdList({
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Read,
        register_addr: w_cmdParam.ADCSampleRate.addr,
        registerCount: w_cmdParam.ADCSampleRate.registerCount,
        cmdType: 'isGetADCSampleRate',
      });

      app.globalData.rad_com.add2cmdList({
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Read,
        register_addr: w_cmdParam.sensorSelfOffset.addr,
        registerCount: w_cmdParam.sensorSelfOffset.registerCount,
        cmdType: 'isGetSensorSelfOffset',
      });

      w_setList.forEach(element => {
        if (element.initSend)
        {
          let comData = {
            radar_addr: app.globalData.modbus_addr,
            funcode: w_cmdParam.fc_Read2,
            register_addr: w_cmdParam[element.variable].addr,
            registerCount: w_cmdParam[element.variable].registerCount,
            id: element.id,
            cmdType: 'isInit',
          }
        
          app.globalData.rad_com.add2cmdList(comData);
        }
      });

      app.globalData.rad_com.add2cmdList({
        radar_addr: app.globalData.modbus_addr,
        funcode: w_cmdParam.fc_Read2,
        register_addr: w_cmdParam.deviceSN.addr,
        registerCount: w_cmdParam.deviceSN.registerCount,
        cmdType: 'isGetdeviceSN',
      });
      
      let _lang_tem = lang._lang();
      for (let i=0; i<this.data.water_setList.length; i++)
      {
        if (this.data.water_setList[i].type == 'select')
        {
          for (let j=0; j<this.data.water_setList[i].option.length; j++)
          {
            this.data.water_setList[i].option[j] = _lang_tem[this.data.water_setList[i].option[j]];
          }
        }
      }

      this.setData({
        _lang: _lang_tem,
        water_setList: this.data.water_setList,
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
})