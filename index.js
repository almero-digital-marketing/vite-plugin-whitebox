import MID from 'node-machine-id'
import os from 'os'
import path from 'path'

const mikserPlugin = ({ version, domain, context, recaptcha, vendor = {} }) => {
    return {
        name: 'mikser',
        config(config, { command }) {
            config.define ||= {}
            Object.assign(config.define, {
                APP_VERSION: JSON.stringify(version),
                WHITEBOX_DOMAIN: JSON.stringify(domain),
                WHITEBOX_CONTEXT: JSON.stringify(context || MID.machineIdSync() + '_' + os.hostname() + '_' + os.userInfo().username),
                WHITEBOX_NO_RECAPTCHA: JSON.stringify(command == 'serve' ? recaptcha : ''),
            })

            config.build ||= {}
            config.build.rollupOptions ||= {}
            config.build.rollupOptions.output ||= {}
            Object.assign(config.build.rollupOptions.output, {                
                manualChunks: id => {
                    if (id.includes('node_modules')) {
                        let moduleName = id.split(path.sep).slice(id.split(path.sep).indexOf('node_modules') + 1)[0]
                        for(let key in vendor) {
                            if (vendor[key].indexOf(moduleName) > -1) return 'vendor-' + key
                        }
                        if (moduleName.includes('whitebox')) {
                            return 'vendor-whitebox';
                        } else if (moduleName.includes('vue')) {
                            return 'vendor-vue';
                        }
                        return 'vendor';
                    }
                }
            })
        },
        configureServer(server) {
            server.httpServer?.once('listening', () => {
                setTimeout(() => {
                    console.log('  🌐 Public: ',`https://${server.config.server.port}-${os.hostname().split('.')[0]}.dev.whitebox.pro/\n`);
                }, 100)
            })
        }
    }
}
export default mikserPlugin