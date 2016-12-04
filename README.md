# anvoy-redux

Official [Anvoy](https://github.com/melnikov-s/anvoy) bindings for [Redux](https://github.com/reactjs/redux).

## Installation

npm:

```
npm install --save anvoy-redux
```

UMD bundle:

[https://unpkg.com/anvoy-redux/lib/anvoy-redux.js](https://unpkg.com/anvoy-redux/lib/anvoy-redux.js)

## Usage

### Provider

`provider(store, Component)`

A higher ordered component that makes the Redux stores available to the connected components. Only needs to be applied to the root Anvoy component.

```javascript
import {Component, render, create} from 'anvoy';
import {provider, connect} from 'anvoy-redux';
import {createStore} from 'redux';

let reducer = (state, action) => ({});
let store = createStore(reducer, {});
class MyRootComponent extends Component {}

render(create(provider(store, MyRootComponent)), document.body);
```

### Connect

`connect(Component, mapStateToProps, mapDispatchToProps)`

A higher ordered component that connects an Anvoy component to a Redux store.

#### Arguments

- `[mapStateToProps(state, ownProps): stateProps] (Function)`: Will be called any time the redux store updates or when the component updates. The result must be a plain object and will be merged with the components props.

- `[mapDispatchToProps(dispatch, ownProps): dispatchProps] (Object or Function)`: (from react-redux docs) If an object is passed, each function inside it will be assumed to be a Redux action creator. An object with the same function names, but with every action creator wrapped into a dispatch call so they may be invoked directly, will be merged into the component’s props. If a function is passed, it will be given `dispatch`. It’s up to you to return an object that somehow uses dispatch to bind action creators in your own way. (Tip: you may use the `bindActionCreators()` helper from Redux.) If you omit it, the default implementation just injects `dispatch` into your component’s props.

# License

The MIT License (MIT)

Copyright (c) 2016 Sergey Melnikov

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
