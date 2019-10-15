# bubble-input
adjust input position auto in Android hybrid app when keyboard is visible

## how to inject
Only inject in the entry file, and invoke the method named 'work'.
Just like this: 

1. in the entry file, you can invoke BubbleInput.work() to start window.onresize listener.
```javascript
// entry file
import BubbleInput from 'bubble-input';
BubbleInput.work();
```

2. in the page, you need invoke BubbleInput.setOffsetBottom() to set distance from the bottom of page, default is 0; and BubbleInput.setTarget() to set the target to scroll, default is window.
```javascript
// page
import BubbleInput from 'bubble-input';

export default class CustomizeRoute extends Component {
  componentDidMount() {
    BubbleInput
      .setOffsetBottom(this.refs.submit.offsetHeight)
      .setTarget(this.refs.container);
  }

  componentWillUnmount() {
    BubbleInput.reset()
  }

  render() {
    return (
      <div className="container" style={{ height: '100%', overflowY: 'auto' }} ref="container">
        <input />
        <div style={{ position: 'fixed', bottom: 0 }} ref="submit" />
      </div>
    );
  }
}
```

3. One more thing, if you set _offsetBottom or _target, you need to invoke BubbleInput.reset(). The method will reset properties. However, I know it will be a bad experience, and I will Optimizate in the future when I have a good idea.
```javascript
// page
export default class CustomizeRoute extends Component {
  componentWillUnmount() {
    BubbleInput.reset()
  }
}
```
