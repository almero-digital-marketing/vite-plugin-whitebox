import MID from 'node-machine-id'
import os from 'os'

const mikserPlugin = ({ version, domain, context, recaptcha }) => {
    return {
        name: 'mikser',
        config(config, { command }) {
            config.define ||= {}
            Object.assign(config.define, {
                APP_VERSION: JSON.stringify(version),
                WHITEBOX_DOMAIN: JSON.stringify(domain),
                WHITEBOX_CONTEXT: JSON.stringify(context || MID.machineIdSync() + '_' + os.hostname() + '_' + os.userInfo().username),
                WHITEBOX_NO_RECAPTCHA: JSON.stringify(command == 'serve' ? recaptcha : JSON.stringify('')),
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