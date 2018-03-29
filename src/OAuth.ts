const d = require('debug')
const debug = d('OAuth')
d.enable('*')

const DEFAULT_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded'
}

export interface AuthorizationOptions {
  'response_type': string
  'scope': string
  'state': string
  'redirect_uri': string,
  [key: string]: string
}

export const GRANT_TYPE = {
  AUTHORIZATION_CODE: 'authorization_code',
  REFRESH_TOKEN: 'refresh_token',
  CLIENT_CREDENTIALS: 'client_credentials'
}

export class OAuth {

  constructor(
    private authorizeUrl: string,
    private tokenUrl: string,
    private revokeUrl: string,
    private clientId: string,
    private clientSecret: string
  ) {

    console.log('test')
    debug('authorizeUrl: ' + authorizeUrl)
    debug('tokenUrl: ' + tokenUrl)
    debug('revokeUrl: ' + revokeUrl)
  }

  public generateAuthorizationURL(options: AuthorizationOptions): string {
    return this.authorizeUrl + '?' +
      this.generateBody(
        Object.assign(
          { client_id: this.clientId },
          options))
  }

  public exchange(code: string, redirectUri: string): Promise<Response> {
    return fetch(
      this.tokenUrl,
      {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: this.generateBody(
          {
            'client_id': this.clientId,
            'client_secret': this.clientSecret,
            'grant_type': GRANT_TYPE.AUTHORIZATION_CODE,
            'code': code,
            'redirect_uri': redirectUri
          }
        )
      }
    )
  }
  public refresh(refreshToken: string, redirectUri: string): Promise<Response> {
    return fetch(
      this.tokenUrl,
      {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: this.generateBody(
          {
            'client_id': this.clientId,
            'client_secret': this.clientSecret,
            'grant_type': GRANT_TYPE.REFRESH_TOKEN,
            'refresh_token': refreshToken,
            'redirect_uri': redirectUri
          }
        )
      }
    )
  }
  public revoke(accessToken: string): Promise<Response> {
    const data = this.generateBody(
      {
        'token': accessToken
      }
    )
    return fetch(
      this.revokeUrl,
      {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: data
      }
    )
  }

  private generateBody(details: { [key: string]: string }): string {
    let formbody: string[] = []
    for (let property in details) {
      formbody.push(
        encodeURIComponent(property) + '=' + encodeURIComponent(details[property])
      )
    }
    return formbody.join('&')
  }
}
