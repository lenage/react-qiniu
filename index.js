/*global URL */

'use strict';
var React = require('react');
var ReactDOM = require('react-dom')
var request = require('superagent-bluebird-promise');

var isFunction = function (fn) {
 var getType = {};
 return fn && getType.toString.call(fn) === '[object Function]';
};
function formatMaxSize(size){
    size=size.toString().toUpperCase();
    var bsize,m=size.indexOf('M'),k=size.indexOf('K');
    if(m > -1){
        bsize = parseFloat(size.slice(0, m)) * 1024 * 1024
    }else if(k > -1){
        bsize = parseFloat(size.slice(0, k)) * 1024
    }else{
        bsize = parseFloat(size)
    }
    return Math.abs(bsize)
}
var ReactQiniu = React.createClass({
    // based on https://github.com/paramaggarwal/react-dropzone
    propTypes: {
        onDrop: React.PropTypes.func.isRequired,
        token: React.PropTypes.string.isRequired,
        // called before upload to set callback to files
        onUpload: React.PropTypes.func,
        size: React.PropTypes.number,
        style: React.PropTypes.object,
        supportClick: React.PropTypes.bool,
        accept: React.PropTypes.string,
        multiple: React.PropTypes.bool,
        // Qiniu
        uploadUrl: React.PropTypes.string,
        prefix: React.PropTypes.string,
        //props to check File Size before upload.example:'2Mb','30k'...
        maxSize:React.PropTypes.string,
    },

    getDefaultProps: function() {
        return {
            supportClick: true,
            multiple: true,
            uploadUrl: 'http://upload.qiniu.com/'
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
        var maxSizeLimit=formatMaxSize(this.props.maxSize)
        for (var i = 0; i < maxFiles; i++) {
            if( maxSizeLimit && files[i].size > maxSizeLimit){
               console.trace && console.trace(new Error('文件大小错误!'))
                this.props.onError && this.props.onError({
                   coed:1,
                   message:'上传的文件大小超出了限制:' + this.props.maxSize
               })
            }else{
                files[i].preview = URL.createObjectURL(files[i]);
                files[i].request = this.upload(files[i]);
                files[i].uploadPromise = files[i].request.promise();
            }
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
            React.createElement('div', {className: className, style: style, onClick: this.onClick, onDragLeave: this.onDragLeave, onDragOver: this.onDragOver, onDrop: this.onDrop},
                                React.createElement('input', {style: {display: 'none'}, type: 'file', multiple: this.props.multiple, ref: 'fileInput', onChange: this.onDrop, accept: this.props.accept}),
                                this.props.children
                               )
        );
    }

});

module.exports = ReactQiniu;
