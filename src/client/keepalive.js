'use strict'

module.exports = function (client, options) {
  const keepAlive = options.keepAlive == null ? true : options.keepAlive
  if (!keepAlive) return

  const checkTimeoutInterval = options.checkTimeoutInterval || 30 * 1000

  client.on('keep_alive', onKeepAlive)

  function onKeepAlive (packet) {
    // Azalea 방식: 타임아웃 로직 제거, 즉시 응답만 처리
    // EPIPE 에러 방지를 위해 연결 상태 확인
    if (client.ended) return
    
    try {
      client.write('keep_alive', {
        keepAliveId: packet.keepAliveId
      })
    } catch (error) {
      // EPIPE 등 소켓 에러는 무시하고 연결 종료 처리
      if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
        client.end('socketError')
      } else {
        client.emit('error', error)
      }
    }
  }
}
