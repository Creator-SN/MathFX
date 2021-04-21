import { execFile } from 'child_process'
import request from 'request';
import path from 'path'
import fs from 'fs'
import zip from 'adm-zip'

const app_root = path.join(__static, '../capture')

export class HandyScreenshotPlugin {
    constructor() {
        this.downloadLink = "https://shrill-pond-3e81.hunsh.workers.dev/https://github.com/minskiter/HandyScreenshot/releases/download/v0.0.1/winx64-HandyScreenshot-Command_v0.0.1.zip"
        this.name = "HandyScreenshot.exe"
        this.compress_zip = "HandyScreenshot.zip";
    }

    /**
     * clip screen
     * @returns {Promise} code
     */
    async clip() {
        let program = execFile(path.join(app_root, this.name));
        return new Promise(resolve => {
            program.on("exit", (code) => {
                resolve(code)
            });
        });
    }

    /**
     * if not existed download screenshot program
     */
    async exists(download = true, downloadPreCallback = null, downloadCallBack = null) {
        return new Promise((resolve, reject) => {
            try {
                if (!fs.existsSync(path.join(app_root, this.name))) {
                    if (download) {
                        console.log("download...")
                        if (downloadPreCallback)
                            downloadPreCallback()
                        request(this.downloadLink).on('error', (error) => {
                            console.error(error)
                            resolve(false)
                        })
                            .pipe(fs.createWriteStream(path.join(app_root, this.compress_zip)).on('finish', () => {
                                let zipfile = new zip(path.join(app_root, this.compress_zip));
                                zipfile.extractAllTo(app_root)
                                fs.renameSync(path.join(app_root, './publish/', this.name), path.join(app_root, this.name))
                                if (downloadCallBack)
                                    downloadCallBack()
                                resolve(true)
                            }))
                        // console.log("extract file")

                    } else {
                        resolve(false)
                    }
                } else {
                    resolve(true)
                }
            } catch (e) {
                console.error(e)
                resolve(false)
            }
        })
    }
}