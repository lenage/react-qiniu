'use strict';

import React from '../node_modules/react';
import Dropzone from '../index';

const ReactQiniuExample = React.createClass({
    getInitialState () {
        return {
            files: [],
            token: 'YOUR_UPLOAD_TOKEN'
        };
    },

    onDrop (files) {
        console.log('Received files: ', files);
        this.setState({
            files: files
        });
    },

    showFiles () {
        if (this.state.files.length <= 0) {
            return '';
        }

        var files = this.state.files;

        return (
            <div className='dropped-files'>
            <h3>Dropped files: </h3>
            <ul>
            {[].map.call(files, function (f, i) {
                var preview = '';
                if (/image/.test(f.type)) {
                    preview = <img src={f.preview} />;
                } else if (/audio/.test(f.type)) {
                    preview = <audio src={f.preview} controls preload> </audio>;
                }
                return <li key={i}>{preview} {f.name + ' : ' + f.size + ' bytes.'}</li>;
            })}
            </ul>
            </div>
        );
    },

    render () {
        var styles = { padding: 30};
        var inputStyles = { marginTop: 30, width: 500};
        return (
            <div className="react-qiniu-example">
              <Dropzone onDrop={this.onDrop} size={300} token={this.state.token} accept="image/*">
                <div style={styles}> Try dropping some files here, or click files to upload. </div>
              </Dropzone>
            {this.showFiles()}
            </div>
        )
    }
});

React.render(<ReactQiniuExample />, document.getElementById('app'));

export default ReactQiniuExample;
