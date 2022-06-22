import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react"
import Surface from './components/Surface'
import Header from './components/Header'
import CipherCompass from './components/Cipher'


const activeChainId = ChainId.Rinkeby;

ReactDOM.render(
  <React.StrictMode>
  	<ThirdwebProvider desiredChainId={activeChainId}>
    	<Header />
    	<App />
		<Surface />
		<CipherCompass />
		<div>footer</div>
	</ThirdwebProvider>
  </React.StrictMode>,
  document.getElementById('root')
);



