# react-qiniu

React Component to upload file to [Qiniu](http://www.qiniu.com/)

![img](https://raw.githubusercontent.com/paramaggarwal/react-dropzone/master/screenshot.png)

Demo avaiable soon

## Usage

Just `require('react-qiniu')` and specify an `onDrop` method that accepts an array of dropped files and pass your Qiniu `token` as prop.

You can also specify a style object to apply to the Drop Zone.
Optionally pass in a size property to configure the size of the Drop Zone.

```jsx
var React = require('react');
var Qiniu = require('react-qiniu);

var ReactQiniuDemo = React.createClass({
    onDrop: function (files) {
      console.log('Received files: ', files);
    },

    render: function () {
      return (
          <div>
            <Qiniu onDrop={this.onDrop} size={150} token="YOUR_QINIU_TOKEN">
              <div>Try dropping some files here, or click to select files to upload.</div>
            </Qiniu>
          </div>
      );
    }
});

React.render(<ReactQiniuDemo />, document.body);
```

see more in `example/app.js`

## Contributing

1. Fork it ( https://github.com/lenage/react-qiniu/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## Thanks

[@paramaggarwal](https://github.com/paramaggarwal/react-dropzone)

## License

MIT
