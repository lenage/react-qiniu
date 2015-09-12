'use strict';

import React from '../node_modules/react';
import Dropzone from '../index';

const ReactQiniuExample = React.createClass({
    getInitialState () {
        return {
            files: [],
            token: 'YOUR_QINIU_TOKEN'
        };
    },

    onUpload (files) {
        let progresses = {};
        let _this = this;
        files.map(function (f) {
            f.onprogress = function(e) {
                progresses[f.preview] = e.percent;
                console.log(e.percent);
                _this.setState({progresses: progresses});
                };
        });
        },

    onDrop (files) {
        console.log('Received files: ', files);
        // This will not work because onDrop called after uploadFiles, so
        // we need a funtion to set hook before call uploadFiles and attach file to function
        this.setState({
            files: files
        });
    },

    showFiles () {
        if (this.state.files.length <= 0) {
            return '';
        }

        var files = this.state.files;
        var progresses = this.state.progresses;
        let styles = {
            width: '600px',
            margin: '10px auto'
        }

        return (
           <div className='dropped-files' style={styles}>
            <h3>Dropped files: </h3>
            <ul>
            {[].map.call(files, function (f, i) {
                // f is a element of files
                // f.uploadPromise => return a Promise to handle uploading status(what you can do when upload failed)
                // f.request => return super-agent request with uploading file
                var preview = '';
                var progress = progresses && progresses[f.preview]
                if (/image/.test(f.type)) {
                    preview = <img src={f.preview} />;
                } else if (/audio/.test(f.type)) {
                    preview = <audio src={f.preview} controls preload> </audio>;
                }
                return <li key={i}>{preview} {f.name + ' : ' + f.size/1000 + 'KB.'}   {(progress || 0) + '% uploaded'}</li>;
            })}
            </ul>
            </div>
        );
    },

    render () {
        var styles = { padding: 30};
        var dropZoneStyles = {
            margin: '20px auto',
            border: '2px dashed #ccc',
            borderRadius: '5px',
            width: '300px',
            height: '200px',
            color: '#aaa'
        }
        var inputStyles = { marginTop: 30, width: 500};
        return (
            <div className="react-qiniu-example">
              <Dropzone onDrop={this.onDrop}
                        onUpload={this.onUpload}
                        size={300}
                        token={this.state.token}
                        accept="image/*"
                        style={dropZoneStyles}>
                <div style={styles}> Try dropping some files here, or click files to upload. </div>
              </Dropzone>
            {this.showFiles()}
            </div>
        )
    }
});

React.render(<ReactQiniuExample />, document.getElementById('app'));

export default ReactQiniuExample;
