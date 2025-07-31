import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { BaseUI } from '../../common/baseui';

/*
  Generated class for the RestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestProvider extends BaseUI{

  constructor(public http: Http) {
    super()
  }

  // configUrl
  public configUrl = 'http://localhost:8080/dgt-core';

  //feed
  private apiUrlFeeds = 'https://imoocqa.gugujiankong.com/api/feeds/get';

  //用户 user
  //首页
  private apiUrlMain = this.configUrl + "user/homepage";
  //首页1
  private apiUrlMain1 = this.configUrl + "home/load";

  //客户回访
  private apiUrlVister = this.configUrl + "user/visit";
  //用户注册
  private apiUrlRegister = this.configUrl + "user/register";
  //用户登录
  private apiUrlLogin = this.configUrl + "user/login";
  //查询用户
  private apiUrlUserInfo = this.configUrl + "user/getUserInfo";
  //获取短信
  private apiUrlGetSms = this.configUrl + "user/getSms";
  //验证短信
  private apiUrlSmsVolidate = this.configUrl + "user/smsVolidate";
  //短信登录
  private apiUrlSmsLogin = this.configUrl + "user/smsLogin";
  //修改用户
  private apiUrlUserUpdate = this.configUrl + "user/update";
  //用户注销(退出登录)
  private apiUrlUserLogout = this.configUrl + "user/logout";
  //修改密码
  private apiUrlUserUptPasswd = this.configUrl + "user/resetPassword";
  //修改高级密码
  private apiUrlUserUptHighPasswd = this.configUrl + "user/updateHighPassword";
  //删除用户
  private apiUrlUserDel = this.configUrl + "user/del";

  //客户 customer
  private apiUrlGetCustomerList = this.configUrl + "customer/getall/";
  private apiUrlAddCustomer = this.configUrl + "customer/add/";
  private apiUrlUpdateCustomer = this.configUrl + "customer/upt/";
  private apiUrlSearchCustomer = this.configUrl + "customer/search/";
  private apiUrlQueryCustomer = this.configUrl + "customer/query/";
  private apiUrlDelCustomer = this.configUrl + "customer/del";

  //订单 order
  //查询订单及列表
  private apiUrlOrder = this.configUrl + "order/get/";
  //搜索订单
  private apiUrlSearchOrder = this.configUrl + "order/search/";
  //添加订单
  private apiUrlAddOrder = this.configUrl + "order/add/";
  //修改订单
  private apiUrlUptOrder = this.configUrl + "order/upt/";
  //删除订单
  private apiUrlDelOrder = this.configUrl + "order/del";
   //删除账单
   private apiUrlDelBill = this.configUrl + "bill/del";
    //删除运单
  private apiUrlDelExpress = this.configUrl + "express/del";
   //删除清单
   private apiUrlDelListDetail = this.configUrl + "list/del";
  //过滤订单
  private apiUrlQueryOrder = this.configUrl + "order/query/";

   //查询订单及列表
   private apiUrlExpressTrace = this.configUrl + "express";

  // goods
  //查询商品列表
  private apiUrlGetGoodsList = this.configUrl + "goods/queryList";
  private apiUrlSearchGoodsList = this.configUrl + "goods/search";
  private apiUrlAddProduct = this.configUrl + "goods/add";
  private apiUrlUpdateProduct = this.configUrl + "goods/update";
  private apiUrlDelProduct = this.configUrl + "goods/del";
  private apiUrlUploadImg = this.configUrl + "goods/uploadImg";

  //采购接口bucket
  //获取采购单列表
  private apiUrlGetBucket = this.configUrl + "bucket/getall";
  //获取采购单列表
  private apiUrlFilterBucket = this.configUrl + "bucket/filter";
  //添加采购单
  private apiUrlAddBucket = this.configUrl + "bucket/add";
  //修改采购单
  private apiUrlUpdateBucket = this.configUrl + "bucket/upt";
  //删除采购单
  private apiUrlDelBucket = this.configUrl + "bucket/del";
  //保存采购单下某种商品
  private apiUrlAddBucketList = this.configUrl + "bucket/addBucketList";
  //修改采购单下某种商品
  private apiUrlUpdateBucketList = this.configUrl + "bucket/uptBucketList";
  //清空采购单下所有商品
  private apiUrlResetBucketList = this.configUrl + "bucket/resetBucketList";
  //删除采购单下某种额外商品
  private apiUrlDelExtraBucketList = this.configUrl + "bucket/delExtraBucketList";
  //保存采购单下某种额外商品
  private apiUrlAddExtraBucketList = this.configUrl + "bucket/addExtraBucketList";
  //修改采购单下某种额外商品
  private apiUrlUpdateExtraBucketList = this.configUrl + "bucket/uptExtraBucketList";
  //移除采购单下某种商品
  private apiUrlDelBucketList = this.configUrl + "bucket/delBucketList";
  //获取采购单额外清单列表
  private apiUrlGetExtraBucketList = this.configUrl + "bucket/getAllExtraBucketList";
  //获取采购单清单列表
  private apiUrlGetBucketList = this.configUrl + "bucket/getAllBucketList";
  //从订单中导入商品
  private apiUrlImportGoods = this.configUrl + "bucket/import";
  //采购小结
  private apiUrlSummary = this.configUrl + "bucket/summary";
  //批量入库
  private apiUrlAddToStore = this.configUrl + "bucket/addToStore";

  //仓库接口store
  //获取仓库列表
  private apiUrlGetStoreList = this.configUrl + "store/queryList";
  //添加仓库
  private apiUrlAddStore = this.configUrl + "store/add";
  //修改仓库
  private apiUrlUpdateStore = this.configUrl + "store/update";
  //删除仓库
  private apiUrlDelStore = this.configUrl + "store/delete";
  //仓库商品统计
  private apiUrlSasStore = this.configUrl + "store/sas";
  //仓库商品查询
  private apiUrlSearchStore = this.configUrl + "store/search";

  //仓库流水查询
  private apiUrlGetStoreDetail = this.configUrl + "storeDetail/queryList";
  //修改仓库流水
  private apiUrlUpdateStoreDetail = this.configUrl + "storeDetail/update";
  //删除仓库流水
  private apiUrlDelStoreDetail = this.configUrl + "storeDetail/delete";
  //添加仓库流水
  private apiUrlAddStoreDetail = this.configUrl + "storeDetail/add";
  //查询仓库商品规格余量
  private apiUrlCountGoodsNum = this.configUrl + "storeDetail/countGoodsNum";
  //拣货
  private apiUrlPickGoods = this.configUrl + "storeDetail/pick";

  //城市查询
  private apiUrlGetProvince = this.configUrl + "city/province";
  private apiUrlGetCity = this.configUrl + "city/city";

  // 我的 设置 setting
  // 设置颜色
  private apiUrlSetColor = this.configUrl + "color/upt";
  // 查询颜色列表
  private apiUrlGetColor = this.configUrl + "color/getall";
  // 点击汇率
  private apiUrlAddRate = this.configUrl + "exchangeRate/add";
  // 删除汇率
  private apiUrlDelRate = this.configUrl + "exchangeRate/del";
  // 修改汇率
  private apiUrlUptRate = this.configUrl + "exchangeRate/upt";
  // 查询汇率列表
  private apiUrlGetRate = this.configUrl + "exchangeRate/getall";

  //登陆后，查询本账号的所有商品分类
  private apiUrlGetUserCategory = this.configUrl + "category/userAll";
  //登陆后，查询本账号的所有一级商品
  private apiUrlGetCategory = this.configUrl + "category/first";
   //查询所有三级商品
   private apiUrlGetThirdCategory = this.configUrl + "category/thirdall";
  //查询所有二级商品
  private apiUrlGetSecondCategory = this.configUrl + "category/secondall";
  //查询所有一级商品
  private apiUrlGetAllCategory = this.configUrl + "category/all";
  // private apiUrlGetAllCity = this.configUrl + 'city';
  private apiUrlGetAllCity = '../../assets/datasource/category.json';
  //设置本账号的一级商品分类
  private apiUrlSetUserCategory = this.configUrl + "category/setfirst";
  //移除本账号的一级商品分类
  private apiUrlRemoveUserCategory = this.configUrl + "category/removefirst";

  //订单统计
  private apiUrlSasOrder = this.configUrl + "sas/order";
  //采购统计
  private apiUrlSasBucket = this.configUrl + "sas/bucket";
  //商品统计
  private apiUrlSasGoods = this.configUrl + "sas/goods";
  //仓库统计
  private apiUrlSasStoreDetail = this.configUrl + "sas/store";
  //客户统计
  private apiUrlSasCustomer = this.configUrl + "sas/customer";
  //客户回访列表
  private apiUrlVisitCustomerList = this.configUrl + "customer/visitList";
  //修改客户回访
  private apiUrlUptVisitCustomer = this.configUrl + "customer/uptVisitList";


  // 本地json文件请求
  getRequestContact() {
    return this.http.get("../assets/datasource/citydata.json")
  }

  private getUrlReturn(url: string): Observable<string[]> {
    if (super.getlog_enable()) {console.log(url);}
    return this.http.get(url)
      .map(this.extractData)
      .catch(this.handleError)
  }

  private httpGet(url: string): Observable<string[]> {
    if (super.getlog_enable()) {console.log(url);}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers })
    return this.http.get(url)
      .map(this.extractData)
      .catch(this.handleError)
  }

  private httpPost(url: string, body: any): Observable<string[]> {
    if (super.getlog_enable()) {console.log(url);}
    if (super.getlog_enable()) {console.log(body);}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers })
    return this.http.post(url, options, body)
      .map(this.extractData)
      .catch(this.handleError)
  }

  private httpPut(url: string, body: any): Observable<string[]> {
    if (super.getlog_enable()) {console.log(url);}
    if (super.getlog_enable()) {console.log(body);}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers })
    return this.http.put(url, body, options)
      .map(this.extractData)
      .catch(this.handleError)
  }

  private httpDelete(url: string, body: any): Observable<string[]> {
    if (super.getlog_enable()) {console.log(url);}
    if (super.getlog_enable()) {console.log(body);}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers })
    //由于底层框架的delete无法传递body参数，故此服务器端无法接收body，所以会空指针
    return this.http.delete(url, options)
      .map(this.extractData)
      .catch(this.handleError)
  }

  private extractData(res: Response) {
    let body = res.json()
    // return JSON.parse(body) || {}
    return body || {}
  }

  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
    // return error;

    // let msg = '请求失败';
    // if (error.status == 0) {
    //   msg = '请求地址错误';
    // }
    // if (error.status == 400) {
    //   msg = '请求无效';
    //   if (super.getlog_enable()) {console.log('请检查参数类型是否匹配');}
    // }
    // if (error.status == 404) {
    //   msg = '请求资源不存在';
    //   console.error(msg + '，请检查路径是否正确');}
    // }
    // if (super.getlog_enable()) {console.log(error);}
    // alert(msg);//这里使用ToastController
    // return { success: false, msg: msg };
  }

  /**
  * @param obj　参数对象
  * @return {string}　参数字符串
  * @example
  *  声明: var obj= {'name':'小军',age:23};
  *  调用: toQueryString(obj);
  *  返回: "?name=%E5%B0%8F%E5%86%9B&age=23"
  */
  private toQueryString(obj) {
    let ret = [];
    for (let key in obj) {
      key = encodeURIComponent(key);
      let values = obj[key];
      if (values && values.constructor == Array) {//数组
        let queryValues = [];
        for (let i = 0, len = values.length, value; i < len; i++) {
          value = values[i];
          queryValues.push(this.toQueryPair(key, value));
        }
        ret = ret.concat(queryValues);
      } else { //字符串
        ret.push(this.toQueryPair(key, values));
      }
    }
    return '?' + ret.join('&');
  }

  /**
   *
   * @param obj
   * @return {string}
   *  声明: var obj= {'name':'小军',age:23};
   *  调用: toQueryString(obj);
   *  返回: "name=%E5%B0%8F%E5%86%9B&age=23"
   */
  private toBodyString(obj) {
    let ret = [];
    for (let key in obj) {
      key = encodeURIComponent(key);
      let values = obj[key];
      if (values && values.constructor == Array) {//数组
        let queryValues = [];
        for (let i = 0, len = values.length, value; i < len; i++) {
          value = values[i];
          queryValues.push(this.toQueryPair(key, value));
        }
        ret = ret.concat(queryValues);
      } else { //字符串
        ret.push(this.toQueryPair(key, values));
      }
    }
    return ret.join('&');
  }


  private toQueryPair(key, value) {
    if (typeof value == 'undefined') {
      return key;
    }
    return key + '=' + encodeURIComponent(value === null ? '' : String(value));
  }

  //用户 user
  register(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlRegister, { 'body': paramObj })
  }

  login(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlLogin, { 'body': paramObj })
  }

  main(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlMain, { 'body': paramObj })
  }

  main1(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlMain1, { 'body': paramObj })
  }

  vistor(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlVister, { 'body': paramObj })
  }

  getUserInfo(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlUserInfo, { 'body': paramObj });
  }

  getSms(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetSms, { 'body': paramObj });
  }

  volidateSms(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSmsVolidate, { 'body': paramObj });
  }

  smsLogin(paramObj): Observable<string[]> {
	return this.httpPost(this.apiUrlSmsLogin, { 'body': paramObj });
  }

  userUpdate(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlUserUpdate, { 'body': paramObj });
  }

  logout(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlUserLogout, { 'body': paramObj });
  }

  updatePassword(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlUserUptPasswd, { 'body': paramObj });
  }

  updateHighPassword(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlUserUptHighPasswd, { 'body': paramObj });
  }

  // updateNickName(userId, nickname): Observable<string[]> {
  //   return this.getUrlReturn(this.apiUrlUpdateNickName + "?userId=" + userId + "&nickname=" + nickname)
  // }

  // saveQuestion(userId, title, content): Observable<string[]> {
  //   return this.getUrlReturn(this.apiUrlQuestionSave + "?userId=" + userId + "&title=" + title + "&content=" + content)
  // }

  //城市
  getProvince(): Observable<string[]> {
    return this.httpGet(this.apiUrlGetProvince)
  }

  getCity(param): Observable<string[]> {
    return this.httpGet(this.apiUrlGetCity + '/' + param)
  }

  //客户
  getCustomerList(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetCustomerList, { 'body': paramObj })
  }
  addCustomer(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlAddCustomer, paramObj)
  }
  updateCustomer(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlUpdateCustomer, paramObj)
  }
  searchCustomer(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSearchCustomer, { 'body': paramObj })
  }
  filterCustomer(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlQueryCustomer, { 'body': paramObj })
  }
  delCustomer(param, paramObj): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelCustomer + '/' + param, { 'body': paramObj })
  }

  /*
  * API porduct
  */


  getUserCategory(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetUserCategory, { 'body': paramObj })
  }

  getCategory(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetCategory, { 'body': paramObj })
  }

  getSecondCategory(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetSecondCategory, { 'body': paramObj })
  }

  getThirdCategory(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetThirdCategory, { 'body': paramObj })
  }

  setFirstCategory(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSetUserCategory, { 'body': paramObj })
  }

  removeFirstCategory(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlRemoveUserCategory, { 'body': paramObj })
  }

  getAllCategory(): Observable<string[]> {
    return this.httpGet(this.apiUrlGetAllCategory)
  }

  getAllCity(): Observable<string[]> {
    return this.httpGet(this.apiUrlGetAllCity)
  }

  //商品
  getGoodsList(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetGoodsList, { 'body': paramObj })
  }

  searchGoodsList(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSearchGoodsList, { 'body': paramObj })
  }

  addProduct(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlAddProduct,  paramObj )
  }

  updateProduct(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlUpdateProduct,  paramObj )
  }

  delProduct(param, paramObj): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelProduct + '/' + param, null)
  }

  uploadImg(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlUploadImg,  paramObj)
  }


  /*
  * API order
  */
  //订单
  getOrder(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlOrder, { 'body': paramObj })
  }

  searchOrder(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSearchOrder, { 'body': paramObj })
  }

  addOrder(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlAddOrder,  paramObj )
  }

  uptOrder(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlUptOrder,  paramObj )
  }

  delOrder(paramObj): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelOrder + '/' + paramObj, null)
  }

  delBill(paramObj): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelBill + '/' + paramObj, null)
  }

  delExpress(paramObj): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelExpress + '/' + paramObj, null)
  }

  delListDetail(paramObj): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelListDetail + '/' + paramObj, null)
  }

  queryOrder(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlQueryOrder, { 'body': paramObj })
  }

  queryExpressTrace(param): Observable<string[]> {
    return this.httpGet(this.apiUrlExpressTrace + '/' + param )
  }

  /*
  * API setting
  */

  setColor(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlSetColor,  paramObj )
  }

  getColor(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetColor, { 'body': paramObj })
  }

  addExchangeRate(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlAddRate,  paramObj )
  }

  delExchangeRate(paramObj): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelRate + '/' + paramObj, null)
  }

  uptExchangeRate(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlUptRate, paramObj )
  }

  getExchangeRate(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetRate, { 'body': paramObj })
  }

  //  采购
  getAllBucket(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetBucket, { 'body': paramObj } )
  }

  filterAllBucket(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlFilterBucket, { 'body': paramObj } )
  }

  addBucket(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlAddBucket, paramObj )
  }

  uptBucket(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlUpdateBucket, paramObj )
  }

  delBucket(param): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelBucket + '/' + param, { 'body': null })
  }

  addBucketList(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlAddBucketList,  paramObj )
  }

  uptBucketList(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlUpdateBucketList,  paramObj )
  }

  resetBucketList(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlResetBucketList, { 'body': paramObj })
  }

  delBucketList(paramObj): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelBucketList  + '/' + paramObj, {})
  }

  addExtraBucketList(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlAddExtraBucketList, { 'body': paramObj })
  }

  uptExtraBucketList(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlUpdateExtraBucketList, { 'body': paramObj })
  }

  delExtraBucketList(paramObj): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelExtraBucketList + '/' + paramObj, null)
  }

  getAllBucketList(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetBucketList, { 'body': paramObj })
  }

  getAllExtraBucketList(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetExtraBucketList, { 'body': paramObj })
  }

  import(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlImportGoods, { 'body': paramObj })
  }

  summary(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSummary, { 'body': paramObj })
  }

  addToStore(paramObj, param): Observable<string[]> {
    return this.httpPost(this.apiUrlAddToStore + '/' + param,  { 'body': paramObj } )
  }

//  仓库接口
  queryStore(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetStoreList, { 'body': paramObj })
  }

  addStore(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlAddStore, paramObj )
    // return this.httpPut(this.apiUrlAddStore, { 'body': paramObj })
  }

  updateStore(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlUpdateStore, paramObj )
  }

  deleteStore(param): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelStore + '/' + param, { 'body': null })
  }

  sasStore(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSasStore, { 'body': paramObj })
  }

  searchInStore(paramObj,  param): Observable<string[]> {
    return this.httpPost(this.apiUrlSearchStore + '/' + param, { 'body': paramObj })
  }

  queryStoreDetail(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlGetStoreDetail, { 'body': paramObj })
  }

  addStoreDetail(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlAddStoreDetail, paramObj)
  }

  updateStoreDetail(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlUpdateStoreDetail, { 'body': paramObj })
  }

  deleteStoreDetail(paramObj): Observable<string[]> {
    return this.httpDelete(this.apiUrlDelStoreDetail + '/' + paramObj, null)
  }

  countGoodsNum(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlCountGoodsNum, { 'body': paramObj })
  }

  pick(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlPickGoods, paramObj)
  }

  sasOrder(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSasOrder, { 'body': paramObj })
  }

  sasBucket(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSasBucket, { 'body': paramObj })
  }

  sasGoods(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSasGoods, { 'body': paramObj })
  }

  sasStoreDetail(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSasStoreDetail, { 'body': paramObj })
  }

  sasCustomer(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlSasCustomer, { 'body': paramObj })
  }

  visitCustomerList(paramObj): Observable<string[]> {
    return this.httpPost(this.apiUrlVisitCustomerList, { 'body': paramObj })
  }

  uptVisitList(paramObj): Observable<string[]> {
    return this.httpPut(this.apiUrlUptVisitCustomer, paramObj )
  }

}

