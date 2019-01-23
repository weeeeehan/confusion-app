import React from 'react';
import { View } from 'react-native';
import AppContainer from './components/MainComponent';

export default class App extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, paddingTop: 0 }}>
        <AppContainer />
      </View>
    );
  }
}
