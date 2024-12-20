// component/text-com/text-com.js

var lang = require('../../utils/languageUtils');


Component({
  /**
   * 组件的属性列表
   */

  properties: {
    _lang: {
      type: Object,
      value: lang._lang(),
    },
    textLabel: {
      type: String,
      value: '',
    },
    text: {
      type: String,
      value: '',
      observer: 'disText'
    },
    textUnit: {
      type: String,
      value: '',
    },
    setConfig: {
      type: String,
      value: '',
    },
    tips: {
      type: String,
      value: '',
    },
    variable: {
      type: String,
      value: '',
    },
    comId: {
      type: String,
      value: null,
    },
    textType: {
      type: String,
      value: 'digit',
    },
    comId2: {
      type: String,
      value: null,
    },
    buttonLock: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    cat_SetValue(e) {
      let that = this;

      this.triggerEvent('setcmd', {
        'text': this.properties.text,
        'id': this.properties.comId,
        'id2': this.properties.comId2,
        'variable': this.properties.variable,
      });
    },

    cat_ReadValue(e) {
      this.triggerEvent('readcmd', {
        'variable': this.properties.variable,
        'id': this.properties.comId,
        'id2': this.properties.comId2,
      });
    },

    bindInputChange(e) {
      this.setData({
        'text': e.detail.value,
      })
    }
  }
})
