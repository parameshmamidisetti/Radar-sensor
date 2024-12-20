var app = getApp();

// 获取当前存的语言选择结果，如果没有默认用中文
const languageVersion = function () {
  switch (wx.getStorageSync('lang')) {
    case 'zh':
      return 'zh';
    case 'en':
      return 'en';
    case 'ru':
      return 'ru';
    default:
      return 'zh';
  }
}

//返回翻译数据
function translate() {
  return require('../language/_' + languageVersion() + '.js').languageMap;
}

//切换语言方法
const changeLanguage= function (langType) {
  if (langType == 1) {
    wx.setStorageSync('lang', 'en');
    app.globalData.currentLanguage = 'en';
  } else if (langType == 0) {
    wx.setStorageSync('lang', 'zh');
    app.globalData.currentLanguage = 'zh';
  } else {
    wx.setStorageSync('lang', 'ru');
    app.globalData.currentLanguage = 'ru';
  }
}

//抛出方法
module.exports = {
  languageVersion: languageVersion,
  changeLanguage: changeLanguage,
  _lang: translate,
}