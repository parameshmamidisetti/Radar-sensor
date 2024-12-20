// component/measureResults/measureResults.js
var lang = require('../../utils/languageUtils');

Component({
  properties: {
    _lang: {
      type: Object,
      value: lang._lang(),
    },
    dampingResult: { // 属性名
      type: Number,
      value: -1,
      observer: 'dis_DampingResult'
    },
    mARealtimeValue: { // 属性名
      type: Number,
      value: -1,
      observer: 'dis_mARealtimeValue'
    },
    radarErrorCode: {
      type: Number,
      value: 0,
      observer: 'dis_RadarError'
    },
    commError: {
      type: Number,
      value: 0,
      observer: 'dis_CommError'
    },
    bleList: {
      type: Array,
      value: [],
    },
    // 传感器模式 0-物位；1-空高；2-距离
    sensorMode: {
      type: Number,
      value: 2,
      observer: 'dis_SensorMode'
    },
    // 电流函数
    mAcurrentutputFunction: {
      type: Number,
      value: 0,
      observer: 'dis_mAcurrentutputFunction'
    },
    // ble连接状态
    bleConnectStatus: {
      type: Boolean,
      value: false,
    },
    // bleName
    bleName: {
      type: String,
      value: '',
      observer: 'dis_bleName'
    },
    deviceTpye: {
        type: String,
        value: '物位计',
    },
  },

  data: {
    v_DampingResult: '--',
    v_mARealtimeValue: '--',
    v_error: '',
    //传感器模式 
    v_sensorMode: '距离',
    // 电流函数
    v_mAcurrentutputFunction: '物位',
    // 电流输出 百分比
    v_Percentage: '--',
    // 设备名称
    v_bleName: '',
    // 蓝牙连接状态
    bleConnectStatus: false,
    //蓝牙BLE设备
    bleDevice: null,
    // 设备类型
    device_tpye: '物位计',
  },

  methods: {
    // 显示测量结果
    dis_DampingResult(dampingResult) {
      let r = '--';
      if (dampingResult >= 0) r = dampingResult.toFixed(4);
      this.setData({
        v_DampingResult: r
      });
    },
    // 显示实时电流
    dis_mARealtimeValue(mARealtimeValue) {
      let e = mARealtimeValue / 1000;
      let r = '--';
      let p = '--'
      if (e >= 4) p = ((e - 4) / 16 * 100).toFixed(2);
      if (e >= 0) r = e.toFixed(3);
      this.setData({
        v_mARealtimeValue: r,
        v_Percentage: p + '%'
      });
    },

    // 显示雷达错误信息
    dis_RadarError(radarErrorCode) {
      let r = '';
      // 雷达自身报警
      if (radarErrorCode) {
        if (radarErrorCode & 0x0001) r += this.properties._lang["丢波"]+";"
        if (radarErrorCode & 0x0002) r += this.properties._lang["TR通信异常"]+";"
        if (radarErrorCode & 0x0004) r += this.properties._lang["无阈值数据"]+";"
        if (radarErrorCode & 0x0008) r += this.properties._lang["电流异常"]+";"
        if (radarErrorCode & 0x0010) r += this.properties._lang["电流手动"]+";"
        if (radarErrorCode & 0x0020) r += this.properties._lang["LCD异常"]+";"
        if (radarErrorCode & 0x0040) r += this.properties._lang["TR连接异常"]+";"
        if (radarErrorCode & 0x0080) r += this.properties._lang["时钟异常"]+";"
        if (radarErrorCode & 0x0100) r += this.properties._lang["处理器异常"]+";"
        if (radarErrorCode & 0x0200) r += this.properties._lang["温度传感器异常"]+";"
        if (radarErrorCode & 0x0400) r += this.properties._lang["采集异常"]+";"
      }
      // 判断通讯错误
      if (this.data.commError) {
        if (this.data.commError == 1) r += this.properties._lang["通讯异常"]+";"
      }
      this.setData({
        v_error: r
      });
    },
    // 显示通讯错误信息
    dis_CommError(commError) {
      let r = '';
      let radarErrorCode = this.data.radarErrorCode;
      // 雷达自身报警
      if (radarErrorCode) {
        if (radarErrorCode & 0x0001) r += this.properties._lang["丢波"]+";"
        if (radarErrorCode & 0x0002) r += this.properties._lang["TR通信异常"]+";"
        if (radarErrorCode & 0x0004) r += this.properties._lang["无阈值数据"]+";"
        if (radarErrorCode & 0x0008) r += this.properties._lang["电流异常"]+";"
        if (radarErrorCode & 0x0010) r += this.properties._lang["电流手动"]+";"
        if (radarErrorCode & 0x0020) r += this.properties._lang["LCD异常"]+";"
        if (radarErrorCode & 0x0040) r += this.properties._lang["TR连接异常"]+";"
        if (radarErrorCode & 0x0080) r += this.properties._lang["时钟异常"]+";"
        if (radarErrorCode & 0x0100) r += this.properties._lang["处理器异常"]+";"
        if (radarErrorCode & 0x0200) r += this.properties._lang["温度传感器异常"]+";"
        if (radarErrorCode & 0x0400) r += this.properties._lang["采集异常"]+";"
      }
      // 判断通讯错误
      if (commError) {
        if (commError == 1) r += this.properties._lang["通讯异常"]+";"
      }
      this.setData({
        v_error: r
      });
    },
    // 电流函数
    dis_mAcurrentutputFunction(mAcurrentutputFunction) {
      let msg = ''
      // 0-物位；1-空高；2-距离
      switch (mAcurrentutputFunction) {
        case 0:
          msg = '物位';
          break;
        case 1:
          msg = '空高';
          break;
        case 2:
          msg = '距离';
          break;
      }
      if (msg.length) {
        this.setData({
          v_mAcurrentutputFunction: msg
        });
      }
    },
    // 显示传感器模式
    dis_SensorMode(sensorMode) {
      let msg = ''
      // 0-物位；1-空高；2-距离
      switch (sensorMode) {
        case 0:
          msg = '物位';
          break;
        case 1:
          msg = '空高';
          break;
        case 2:
          msg = '距离';
          break;
      }
      if (msg.length) {
        this.setData({
          v_sensorMode: msg
        });
      }
    },
    // 显示蓝牙名称
    dis_bleName(bleName) {
      let name = bleName.trim();
      if (this.checkStrDisplayLen(name) > 19) {
        name = name.slice(0, 16) + '...';
      }
      this.setData({
        v_bleName: name
      });
    },
    // 选择ble设备
    cat_changeBle: function (e) {
      // 连接对应的蓝牙设备
      this.triggerEvent('bleconnect', this.data.bleList[e.detail.value]);
    },
    // 打开BLE列表选择界面
    cat_openBleList(e) {
      this.triggerEvent('blelisttap');
    },
    cat_cancel: function (e) {
      this.triggerEvent('blecancel');
    },
    // 查询字符串真实显示长度 中文+1
    checkStrDisplayLen(str) {
      var strlen = 0;
      for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) //如果是汉字，则字符串长度加1
          strlen += 1;
        else
          strlen++;
      }
      return strlen;
    }
  }
})