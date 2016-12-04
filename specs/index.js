import {Component, render, create} from 'anvoy';
import {createStore} from 'redux';
import {connect, provider} from '../src';

//force setTimeout fallback so we can use fake clock
window.requestAnimationFrame = false;
jasmine.clock().install();

describe("Avoy Redux", () => {
    let x;
    let y;
    let incX = () => x++;
    let incY = () => y++;

    beforeEach(() => {
        x = 0;
        y = 0;
    });

    it("should pass props to the given component", () => {
        let reducer = (state, action) => ({});
        let store = createStore(reducer, {});
        let Child = connect(class extends Component {
            willMount() {
                expect(this.props.prop).toBe('value');
                incX();
            }
        });

        let Root = provider(store, class extends Component {
            render(props) {
                return create(Child, props);
            }
        });


        render(create(Root, {prop: 'value'}), document.body);
        expect(x).toBe(1);
    });

    it("should recieve store dispatch as the defaultDispatchToProps", () => {
        let reducer = (state, action) => ({});
        let store = createStore(reducer, {});
        let Child = connect(class extends Component {
            willMount() {
                expect(this.props.dispatch).toBe(store.dispatch);
                incX();
            }
        });

        let Root = provider(store, class extends Component {
            render(props) {
                return create(Child);
            }
        });


        render(create(Root, {}), document.body);
        expect(x).toBe(1);
    });

    it("should map store state to props", () => {
        let reducer = (state = {}) => state;
        let store = createStore(reducer, {storeProp: 'value'});
        let Child = connect(class extends Component {
            willMount() {
                expect(this.props.prop).toBe('value');
                expect(this.props.storeProp).toBe('value');
                incX();
            }
        }, (state, props) => {
            expect(props.prop).toBe('value');
            incY();
            return state;
        });

        let Root = provider(store, class extends Component {
            render(props) {
                return create(Child, props);
            }
        });

        render(create(Root, {prop: 'value'}), document.body);
        expect(x).toBe(1);
        expect(y).toBe(1);
    });

    it("should map actions to props", () => {
        let actionCreator = () => ({});
        let reducer = (state = {}) => state;
        let store = createStore(reducer, {prop: 'value'});
        let Child = connect(class extends Component {
            willMount() {
                expect(this.props.prop).toBe('value');
                expect(this.props.action).toBe(actionCreator);
                incX();
            }
        }, (state) => state, function(dispatch, props) {
            expect(props.prop).toBe('value');
            expect(dispatch).toBe(store.dispatch);
            incY();
            return {
                action: actionCreator
            };
        });

        let Root = provider(store, class extends Component {
            render() {
                return create(Child);
            }
        });

        render(create(Root, {prop: 'value'}), document.body);
        expect(x).toBe(1);
        expect(y).toBe(1);
    });

    it("should bind action creators when an object is passed for `mapDispatchToProps`", () => {
        let action = {};
        let actionCreator = () => action;
        let reducer = (state = {}) => state;
        let store = createStore(reducer, {prop: 'value'});

        store.dispatch = (actionIn) => {
            expect(actionIn).toBe(action);
            incY();
        };

        let Child = connect(class extends Component {
            willMount() {
                expect(typeof this.props.action).toBe('function');
                this.props.action();
                incX();
            }
        }, (state) => state, {
            action: actionCreator
        });

        let Root = provider(store, class extends Component {
            render() {
                return create(Child);
            }
        });

        render(create(Root, {prop: 'value'}), document.body);
        expect(x).toBe(1);
        expect(y).toBe(1);
    });

    it("should prioritize state over props and actions over state", () => {
        let reducer = (state = {}) => state;
        let store = createStore(reducer, {prop: 'value'});
        let Child = connect(class extends Component {
            willMount() {
                expect(this.props.propA).toBe('action');
                expect(this.props.propB).toBe('state');
                expect(this.props.propC).toBe('props');
                incX();
            }
        }, () => {
            return {propA: 'state', propB: 'state'};
        }, () => {
            return {propA: 'action'};
        });

        let Root = provider(store, class extends Component {
            render(props) {
                return create(Child, props);
            }
        });

        render(create(Root, {propA: 'props', propB: 'props', propC: 'props'}), document.body);
        expect(x).toBe(1);
    });

    it("should return a reference to the underlying connected component when using `ref`", () => {
        let ref;
        let store = createStore(() => ({}), {});
        let Child = connect(class extends Component {
            willMount() {
                this.correctRef = true;
            }
        });

        let Root = provider(store, class extends Component {
            render(props) {
                let desc = create(Child, props);
                desc.ref = (r) => ref = r;
                return desc;
            }
        });

        render(create(Root, {prop: 'value'}), document.body);
        expect(ref.correctRef).toBe(true);
    });

    it("should subscribe components to the store changes", () => {
        let reducer = (state = {}, {newState}) => {
            if (newState) return newState;

            return state;
        };

        let store = createStore(reducer, {propA: 0, propB: 0});
        let ChildA = connect(class extends Component {
            willMount() {
                expect(this.props.propA).toBe(0);
                incX();
            }
            willUpdate(props) {
                expect(props.propA).toBe(1);
                incX();
            }
        }, ({propA}) => ({propA}));

        let ChildB = connect(class extends Component {
            willMount() {
                expect(this.props.propB).toBe(0);
                incY();
            }
            willUpdate(props) {
                expect(props.propB).toBe(1);
                incY();
            }
        }, ({propB}) => ({propB}));

        let Root = provider(store, class extends Component {
            static el() {
                return `<div><@children/></div>`;
            }
            render(props) {
                return {children: [create(ChildA), create(ChildB)]};
            }
        });

        render(create(Root, {prop: 'value'}), document.body);
        expect(x).toBe(1);
        expect(y).toBe(1);
        store.dispatch({type: 'set', newState: {propA: -1, propB: -1}});
        store.dispatch({type: 'set', newState: {propA: 1, propB: 1}});
        expect(x).toBe(1);
        expect(y).toBe(1);
        jasmine.clock().tick(1);
        expect(x).toBe(2);
        expect(y).toBe(2);
    });

    it("should throw an error if connect is used without a provider", () => {
        let Child = connect(class extends Component {});

        let Root = class extends Component {
            render(props) {
                return create(Child, props);
            }
        };

        expect(() => render(create(Root, {}), document.body)).toThrow(
            new Error("Anvoy: Root component must be wrapped with `provider`.")
        );
    });

    it("should unsubscribe from the store when unmounting", () => {
        let ref;
        let clear = false;
        let reducer = (state, action) => ({});
        let store = createStore(reducer, {});
        let Child = connect(class extends Component {});

        let Root = provider(store, class extends Component {
            render(props) {
                let desc = create(Child, props);
                desc.ref = (c) => ref = c;
                return clear ? null : desc;
            }
        });

        render(create(Root, {prop: 'value'}), document.body);
        spyOn(ref, 'render');
        store.dispatch({type: 'set'});
        jasmine.clock().tick(1);
        expect(ref.render.calls.count()).toBe(1);
        clear = true;
        render(create(Root, {prop: 'value'}), document.body);
        expect(ref.render.calls.count()).toBe(1);
        store.dispatch({type: 'set'});
        jasmine.clock().tick(1);
        expect(ref.render.calls.count()).toBe(1);
    });

    it("always updates connected components when store state changes", () => {
        let reducer = (state = {}, {newState}) => {
            if (newState) return newState;

            return state;
        };

        let store = createStore(reducer, {propA: 0, propB: 0});
        let GrandChildA = connect(class extends Component {
            willMount() {
                expect(this.props.propA).toBe(0);
                incX();
            }
            willUpdate(props) {
                expect(props.propA).toBe(1);
                incX();
            }
            render() {
                return create(ChildB);
            }
        }, ({propA}) => ({propA}));

        let GrandChildB = connect(class extends Component {
            willMount() {
                expect(this.props.propB).toBe(0);
                incY();
            }
            willUpdate(props) {
                expect(props.propB).toBe(1);
                incY();
            }
        }, ({propB}) => ({propB}));

        let ChildB = class extends Component {
            shouldUpdate() {
                return false;
            }
            static el() {
                return `<div><@children/></div>`;
            }
            render() {
                return {children: create(GrandChildB)};
            }
        };

        let ChildA = class extends Component {
            static el() {
                return `<div><@children/></div>`;
            }

            render() {
                return {children: create(GrandChildA)};
            }
        };

        let Root = provider(store, class extends Component {
            render() {
                return create(ChildA);
            }
        });

        render(create(Root, {prop: 'value'}), document.body);
        expect(x).toBe(1);
        expect(y).toBe(1);
        store.dispatch({type: 'set', newState: {propA: -1, propB: -1}});
        store.dispatch({type: 'set', newState: {propA: 1, propB: 1}});
        expect(x).toBe(1);
        expect(y).toBe(1);
        jasmine.clock().tick(1);
        expect(x).toBe(2);
        expect(y).toBe(2);
    });
});
