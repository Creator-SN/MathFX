import Datastore from 'lowdb'
import dataSample from './data_sample'
import FileSync from 'lowdb/adapters/FileSync'
const nodeRequire = window.require;
const path = nodeRequire('path');
const fs = nodeRequire('fs-extra');
const STORE_PATH = globalThis.api?.userDataPath || path.join(process.cwd(), '.mathfx-data')

const adapter = new FileSync(path.join(STORE_PATH, '/data.json')) // 初始化lowdb读写的json文件名以及存储路径

console.log(STORE_PATH)

const db = Datastore(adapter) // lowdb接管该文件

init_db_file();
init_db();

export default db // 暴露出去


/**
 * 初始化数据库文件
 *
 */
function init_db_file() {
  if (!fs.pathExistsSync(STORE_PATH)) {
    fs.mkdirpSync(STORE_PATH)
  }
}


/**
 * 初始化数据库内容
 *
 */
function init_db() {
  if (!db.has('init_status').value()) { // 先判断该值存不存在
    db.defaults(dataSample)
      .write()
  }
}
