import Datastore from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import path from 'path'
import fs from 'fs-extra'
import { app, remote } from 'electron' // 引入remote模块

const APP = process.type === 'renderer' ? remote.app : app // 根据process.type来分辨在哪种模式使用哪种模块

const STORE_PATH = APP.getPath('userData') // 获取electron应用的用户目录

const adapter = new FileSync(path.join(STORE_PATH, '/data.json')) // 初始化lowdb读写的json文件名以及存储路径

const db = Datastore(adapter) // lowdb接管该文件

init_db_file();
init_db();

export default db // 暴露出去


/**
 * 初始化数据库文件
 *
 */
function init_db_file() {
    if (process.type !== 'renderer') {
        if (!fs.pathExistsSync(STORE_PATH)) { // 如果不存在路径
            fs.mkdirpSync(STORE_PATH) // 就创建
        }
    }
}


/**
 * 初始化数据库内容
 *
 */
function init_db() {
    if (!db.has('init_status').value()) { // 先判断该值存不存在
        db.defaults({
            init_status: true,
            subscriptions: [
                {
                    name: 'mathpix',
                    title: 'MathPix API',
                    data: [
                        { name: 'Url', key: 'url', value: '' },
                        { name: 'App ID', key: 'app_id', value: '' },
                        { name: 'Key', key: 'app_key', value: '' }
                    ]
                },
                {
                    name: "xunfei",
                    title: "Xunfei API",
                    data: [
                        { name: "Url", key: "url", value: '' },
                        { name: "App ID", key: "app_id", value: '' },
                        { name: "App Key", key: "app_key", value: '' },
                        { name: "App Secret", key: "app_secret", value: "" }
                    ]
                },
                {
                    name: 'baidu',
                    title: 'Baidu API(Not Recommend)',
                    data: [
                        { name: 'Url', key: 'url', value: '' },
                        { name: 'API Key', key: 'api_key', value: '' },
                        { name: 'Secret Key', key: 'secret_key', value: '' }
                    ]
                }
            ],
            cur_sub: 0,
            cur_h: 0,
            history: [

            ],
            theme: "light"
        })
            .write()
    }
}