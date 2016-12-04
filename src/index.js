import * as Anvoy from 'anvoy';
import {bindActionCreators} from 'redux';

let {extend, error} = Anvoy.utils;

export function connect(
    Component, mapStateToProps = () => ({}), mapDispatchToProps = (dispatch) => ({dispatch})
) {
    let mapDispatch = mapDispatchToProps;

    if (typeof mapDispatchToProps === 'object') {
        mapDispatch = dispatch => bindActionCreators(mapDispatchToProps, dispatch);
    }

    return class extends Anvoy.Component {
        willMount() {
            this._setRef = this._setRef.bind(this);
            let {store} = this.context;

            if (!store) {
                error("root component must be wrapped with `provider`");
            }

            this._unsubscribe = store.subscribe(() => {
                Anvoy.scheduleUpdate(this);
            });
        }

        willUnmount() {
            this._unsubscribe();
        }

        getRef() {
            return this._ref;
        }

        _setRef(ref) {
            this._ref = ref;
        }

        render(props) {
            let store = this.context.store;
            let state = store.getState();
            let childProps = extend({}, props);
            let stateProps = mapStateToProps(state, childProps);
            childProps = extend(childProps, stateProps);
            if (mapDispatch) {
                let dispatchProps = mapDispatch(store.dispatch, childProps);
                childProps = extend(childProps, dispatchProps);
            } else {
                childProps = extend(childProps, {dispatch: store.dispatch});
            }

            let desc = Anvoy.create(Component, childProps);
            desc.ref = this._setRef;
            return desc;
        }
    };
};

export function provider(store, Component) {
    return class extends Anvoy.Component {
        getChildContext() {
            return {store};
        }
        render(props) {
            return Anvoy.create(Component, props);
        }
    };
};
