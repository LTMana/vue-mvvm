export default class Dep {
  constructor () {
      // 订阅的数组
      this.subs = [];
  }
  addSub (watcher) { // 添加订阅
      console.log(watcher)
      this.subs.push(watcher);
  }
  notify () { // 通知
      this.subs.forEach(watcher => watcher.update());
  }
}