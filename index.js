/**
 * Modified by Sirosong   <277702281@qq.com>
 * At 2019/4/26
 * support React after version 15.4
 */
'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import createReactClass from 'create-react-class'
import request from 'superagent-bluebird-promise'

var isFunction = function (fn) {
 var getType = {};
 return fn && getType.toString.call(fn) === '[object Function]';
};

var ReactQiniu = createReactClass({
    // based on https://github.com/paramaggarwal/react-dropzone
    
    getDefaultProps: function() {
        var uploadUrl = 'http://upload.qiniu.com'
        if (window.location.protocol === 'https:') {
          uploadUrl = 'https://up.qbox.me/'
        }

        return {
            supportClick: true,
            multiple: true,
            uploadUrl: uploadUrl
        };
    },

    getInitialState: function() {
        return {
            isDragActive: false
        };
    },

    onDragLeave: function(e) {
        this.setState({
            isDragActive: false
        });
    },

    onDragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        this.setState({
            isDragActive: true
        });
    },

    onDrop: function(e) {
        e.preventDefault();

        this.setState({
            isDragActive: false
        });

        var files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }

        var maxFiles = (this.props.multiple) ? files.length : 1;

        if (this.props.onUpload) {
            files = Array.prototype.slice.call(files, 0, maxFiles);
            this.props.onUpload(files, e);
        }

        for (var i = 0; i < maxFiles; i++) {
            files[i].preview = URL.createObjectURL(files[i]);
            files[i].request = this.upload(files[i]);
            files[i].uploadPromise = files[i].request.promise();
        }

        if (this.props.onDrop) {
            files = Array.prototype.slice.call(files, 0, maxFiles);
            this.props.onDrop(files, e);
        }
    },

    onClick: function () {
        if (this.props.supportClick) {
            this.open();
        }
    },

    open: function() {
        var fileInput = ReactDOM.findDOMNode(this.refs.fileInput);
        fileInput.value = null;
        fileInput.click();
    },

    upload: function(file) {
        if (!file || file.size === 0) return null;
        var key = file.preview.split('/').pop() + '.' + file.name.split('.').pop();
        if (this.props.prefix) {
            key = this.props.prefix  + key;
        }

        if(this.props.uploadKey){
          key = this.props.uploadKey;
        }

        var r = request
            .post(this.props.uploadUrl)
            .field('key', key)
            .field('token', this.props.token)
            .field('x:filename', file.name)
            .field('x:size', file.size)
            .attach('file', file, file.name)
            .set('Accept', 'application/json');
        if (isFunction(file.onprogress)) { r.on('progress', file.onprogress); }
        return r;
    },

    render: function() {
        var className = this.props.className || 'dropzone';
        if (this.state.isDragActive) {
            className += ' active';
        }

        var style = this.props.style || {
            width: this.props.size || 100,
            height: this.props.size || 100,
            borderStyle: this.state.isDragActive ? 'solid' : 'dashed'
        };


        return (
            React.createElement(
              'div',
              {
                className: className, 
                style: style, 
                onClick: this.onClick, 
                onDragLeave: this.onDragLeave, 
                onDragOver: this.onDragOver, 
                onDrop: this.onDrop
              },
              React.createElement(
                'input',
                {
                  style: {display: 'none'}, 
                  type: 'file', 
                  multiple: this.props.multiple, 
                  ref: 'fileInput', 
                  onChange: this.onDrop, 
                  accept: this.props.accept
                }
              ),
              this.props.children
            )
        );
    }

});

ReactQiniu.propTypes = {
  onDrop: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
  // called before upload to set callback to files
  onUpload: PropTypes.func,
  size: PropTypes.number,
  style: PropTypes.object,
  supportClick: PropTypes.bool,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  // Qiniu
  uploadUrl: PropTypes.string,
  uploadKey: PropTypes.string,
  prefix: PropTypes.string
}

export default ReactQiniu;