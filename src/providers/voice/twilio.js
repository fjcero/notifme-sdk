/* @flow */
import fetch from '../../util/request'
import FormData from 'form-data'
// Types
import type {VoiceRequestType} from '../../models/notification-request'

export default class VoiceTwilioProvider {
  id: string = 'voice-twilio-provider'
  accountSid: string
  apiKey: string

  constructor ({accountSid, authToken}: Object) {
    this.accountSid = accountSid
    this.apiKey = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
  }

  /*
   * Note: 'type', 'nature', 'messageClass' are not supported.
   */
  async send (request: VoiceRequestType): Promise<string> {
    const {from, to, url} = request
    const form = new FormData()
    form.append('From', from)
    form.append('To', to)
    form.append('Url', url)
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.apiKey}`,
        'User-Agent': 'notifme-sdk/v1 (+https://github.com/notifme/notifme-sdk)'
      },
      body: form
    })

    const responseBody = await response.json()
    if (response.ok) {
      return responseBody.sid
    } else {
      throw new Error(`${response.status} - ${responseBody.message}`)
    }
  }
}
