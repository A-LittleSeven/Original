var config = require('../../config.js');
var appInstance = getApp()
var chargeUtils = require('../../utils/charge.js');
var couponUtils = require('../../utils/coupon.js')

Page({
  data: {
    noCoupon: false,
    loadmore: false,
    loadText: '正在努力加载...',
    couponList: [],
    pageMeta: {},
    type: 1,
    price: 0
  },
  onLoad(option) {
    console.log(option)
    this.setData({
      couponList: [],
      loadmore: true,
      loadText: '正在努力加载...',
      price: option.price
    })
    this.getCouponList(this.data.type, 1)
  },
  /**
   *  页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.loadmore === true) {
      let page = this.data.pageMeta.currentPage + 1
      let type = 0
      console.log('加载分页数据 页码: ' + page)
      this.getCouponList(type, page)
    } else {
      console.log('没有下一页的数据了')
    }
  },
  /**
   *  页面下拉刷新的处理事件
   */
  onPullDownRefresh() {
    this.setData({
      couponList: [],
      loadmore: true,
      loadText: '正在努力加载...'
    })
    this.getCouponList(this.data.type, 1)
  },
  onClick: function (e) {
    console.log(`ComponentId:${e.detail.componentId},you selected:${e.detail.key}`);
    var that = this
    let tab = this.data.tabs[e.detail.key]
    that.setData({
      type: tab.type
    }, function () {
      that.onPullDownRefresh()
    })
  },
  /**
   *  根据分类、页数 加载优惠券列表
   */
  getCouponList: function (type, page) {
    var that = this
    couponUtils.getCouponList({
      'type': type,
      'page': page,
      'success': function (res) {
        console.log('优惠券列表获取成功回调')
        console.log(res)
        let list = that.data.couponList
        for (var i = 0; i < res.items.length; i++) {
          list.push(res.items[i])
        }

        that.setData({
          couponList: list,
          pageMeta: res.meta
        }, function () {
          console.log('now couponlist is : ')
          console.log(that.data.couponList)
        })

        if (res.meta.currentPage < res.meta.pageCount) {
          that.setData({
            loadmore: true,
            loadText: '正在努力加载...'
          })
        } else {
          that.setData({
            loadmore: false,
            loadText: '到底啦~',
          })
        }
      },
      'fail': function (error) {
        console.log('优惠券列表失败回调')
      }
    })
  },
  onClick(e) {
    let item = e.currentTarget.dataset.item 
    console.log(item);
    let price = parseFloat(this.data.price)
    if (item.coupon.type === 2) {
      if (item.coupon.conditions > price) {
        wx.showToast({
          title: '您挑选的商品未达到满减要求',
          icon: 'none',
          duration: 1500
        })
        return
      }
    }
    this.saveCouponData(item)
  },
  saveCouponData(data) {
    try {
      wx.setStorageSync('currentCoupon', data)
      wx.navigateBack({
        delata: 1
      })
      return
    } catch (e) {

    }
  }
})
