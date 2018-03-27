/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import * as React from 'react'
import {
  StyleSheet,
  View,
  Text,
  Button,
  WebView,
  NavState
} from 'react-native'
import { config } from './config'

type Props = {}
type State = {
  authorize: boolean
  code?: string
  accessToken?: { access_token: string, expires_in: number, refresh_token: string, scope: string, token_type: string }
  user?: any
  revoke?: any
}
export class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = { authorize: false }
  }

  render() {
    if (this.state.authorize) {
      return this.renderAuthorize()
    } else {
      return this.renderButtons()
    }
  }

  renderAuthorize() {
    return (
      <WebView
        source={{ uri: 'https://discordapp.com/api/oauth2/authorize?client_id=' + config.client_id + '&redirect_uri=http%3A%2F%2Flocalhost&response_type=code&scope=identify' }}
        onNavigationStateChange={this.onNavigationStateChange}
      />
    )
  }

  onNavigationStateChange = (event: NavState) => {
    if (!event) return
    if (event.loading) return
    if (event.url && event.url.startsWith('http://localhost')) {
      console.log(this.getParameterByName('code', event.url))
      this.setState(
        Object.assign(
          this.state,
          {
            authorize: false,
            code: this.getParameterByName('code', event.url)
          }
        )
      )
    }
  }
  getParameterByName(name, url) {
    if (!url) url = window.location.href
    name = name.replace(/[\[\]]/g, '\\$&')
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    const results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  renderButtons() {
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button
            onPress={this.onPressLogin}
            title='login'
          />
        </View>
        <View style={styles.buttonContainer}>
          <Text>{this.state.code}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={this.onPressToken}
            title='token'
            color='#2ECC71'
          />
          <Text>{JSON.stringify(this.state.accessToken)}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={this.me}
            title='/users/@me'
            color='#5D6D7E'
          />
          <Text>{JSON.stringify(this.state.user)}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={this.onPressRevoke}
            title='revoke'
            color='#5D6D7E'
          />
        </View>
      </View>
    )
  }

  private onPressLogin = () => {
    console.log('onPressLogin')
    this.setState(
      Object.assign(
        this.state,
        { authorize: true }
      )
    )
  }
  private onPressToken = () => {
    console.log('onPressToken')
    this.exchangeCode()
  }
  private onPressRevoke = () => {
    console.log('onPressRevoke')
    this.revoke()
  }

  private exchangeCode = () => {
    const code = this.state.code
    if (!code) return
    const data =
      'client_id' + '=' + encodeURIComponent(config.client_id) +
      '&' + 'client_secret' + '=' + encodeURIComponent(config.client_secret) +
      '&' + 'grant_type' + '=' + encodeURIComponent('authorization_code') +
      '&' + 'code' + '=' + encodeURIComponent(code) +
      '&' + 'redirect_uri' + '=' + encodeURIComponent('http://localhost')

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
    console.log(data)
    fetch('https://discordapp.com/api/oauth2/token',
      {
        method: 'POST',
        headers: headers,
        body: data
      }
    ).then((response: Response) => response.json())
      .then((json: any) => {
        console.log(json)
        this.setState(
          Object.assign(
            this.state,
            {
              accessToken: json
            }
          )
        )
      })
      .catch((err: Error) => {
        console.error(err)
      })
  }

  private me = () => {
    const accessToken = this.state.accessToken
    if (!accessToken) return
    const access_token = accessToken.access_token
    if (!access_token) return
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization': 'Bearer ' + access_token
    }
    fetch('https://discordapp.com/api/v6/users/@me',
      {
        method: 'GET',
        headers: headers
      }
    ).then((response: Response) => response.json())
      .then((json: any) => {
        console.log(json)
        this.setState(
          Object.assign(
            this.state,
            {
              user: json
            }
          )
        )
      })
      .catch((err: Error) => {
        console.error(err)
      })
  }

  private revoke = () => {
    const accessToken = this.state.accessToken
    if (!accessToken) return
    const access_token = accessToken.access_token
    if (!access_token) return
    const data =
      'token' + '=' + encodeURIComponent(access_token)
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
    fetch('https://discordapp.com/api/oauth2/token/revoke',
      {
        method: 'POST',
        headers: headers,
        body: data
      }
    ).then((response: Response) => {
      console.log(response)
      if (response && response.ok) {
        this.setState(
          {
            code: undefined,
            accessToken: undefined,
            user: undefined,
            authorize: false,
            revoke: true
          })
      } else {
        return response
      }
    })
      .catch((err: Error) => {
        console.error(err)
      })

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF'
  },
  buttonContainer: {
    margin: 20
  },
  alternativeLayoutButtonContainer: {
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})
