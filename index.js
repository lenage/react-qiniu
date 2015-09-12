/*global URL */

var React = require('react');
var Promise = require('bluebird');
var request = require('superagent-bluebird-promise');

var ReactQiniu = React.createClass({
    // based on https://github.com/paramaggarwal/react-dropzone
    propTypes: {
        onDrop: React.PropTypes.func.isRequired,
        token: React.PropTypes.string.isRequired,
        size: React.PropTypes.number,
        style: React.PropTypes.object,
        supportClick: React.PropTypes.bool,
        accept: React.PropTypes.string,
        multiple: React.PropTypes.bool,
        // Qiniu
        uploadUrl: React.PropTypes.string,
        prefix: React.PropTypes.string
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

        for (var i = 0; i < maxFiles; i++) {
            files[i].preview = URL.createObjectURL(files[i]);
            files[i].uploadPromise = this.upload(files[i]);
        }

        if (this.props.onDrop) {
            files = Array.prototype.slice.call(files, 0, maxFiles);
            this.props.onDrop(files, e);
        }
    },

    onClick: function () {
        if (this.props.supportClick === true) {
            this.open();
        }
    },

    open: function() {
        var fileInput = React.findDOMNode(this.refs.fileInput);
        fileInput.value = null;
        fileInput.click();
    },

    upload: function(file) {
        if (!file || file.size === 0) return null;
        var url;
        var key = file.preview.split('/').pop() + '.' + file.name.split('.').pop();
        var _this = this;
        if (this.props.prefix) {
            key = this.props.prefix  + key;
        }
        var promise = request
            .post(this.props.uploadUrl)
            .field('key', key)
            .field('token', this.props.token)
            .field('x:filename', file.name)
            .field('x:size', file.size)
            .attach('file', file, file.name)
            .set('Accept', 'application/json')
            .on('progress',  function (e) {
                if(_this.isFunction(file.onprogress)){
                    file.onprogress(e.percent);
                }
            })
            .promise()
        return promise;
    },

    isFunction: function(fn) {
        var getType = {};
        return fn && getType.toString.call(fn) === '[object Function]';
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
