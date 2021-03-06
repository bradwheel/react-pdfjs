'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

if (typeof window !== 'undefined') {
  require('pdfjs-dist/build/pdf.combined');
}

var Pdf = (function (_Component) {
  _inherits(Pdf, _Component);

  function Pdf(props) {
    _classCallCheck(this, Pdf);

    _Component.call(this, props);
    this.state = {};
    this.onDocumentComplete = this.onDocumentComplete.bind(this);
    this.onPageComplete = this.onPageComplete.bind(this);
  }

  Pdf.prototype.componentDidMount = function componentDidMount() {
    this.loadPDFDocument(this.props);
    this.renderPdf();
  };

  Pdf.prototype.componentWillReceiveProps = function componentWillReceiveProps(newProps) {
    var pdf = this.state.pdf;

    if (newProps.file && newProps.file !== this.props.file || newProps.content && newProps.content !== this.props.content) {
      this.loadPDFDocument(newProps);
    }

    if (pdf && (newProps.page && newProps.page !== this.props.page || newProps.scale && newProps.scale !== this.props.scale)) {
      this.setState({ page: null });
      pdf.getPage(newProps.page).then(this.onPageComplete);
    }
  };

  Pdf.prototype.onDocumentComplete = function onDocumentComplete(pdf) {
    this.setState({ pdf: pdf });
    var onDocumentComplete = this.props.onDocumentComplete;

    if (typeof onDocumentComplete === 'function') {
      onDocumentComplete(pdf.numPages);
    }
    pdf.getPage(this.props.page).then(this.onPageComplete);
  };

  Pdf.prototype.onPageComplete = function onPageComplete(page) {
    this.setState({ page: page });
    this.renderPdf();
    var onPageComplete = this.props.onPageComplete;

    if (typeof onPageComplete === 'function') {
      onPageComplete(page.pageIndex + 1);
    }
  };

  Pdf.prototype.loadByteArray = function loadByteArray(byteArray) {
    window.PDFJS.getDocument(byteArray).then(this.onDocumentComplete);
  };

  Pdf.prototype.loadPDFDocument = function loadPDFDocument(props) {
    var _this = this;

    if (!!props.file) {
      var _ret = (function () {
        if (typeof props.file === 'string') {
          return {
            v: window.PDFJS.getDocument(props.file).then(_this.onDocumentComplete)
          };
        }
        // Is a File object
        var reader = new FileReader();
        reader.onloadend = function () {
          return _this.loadByteArray(new Uint8Array(reader.result));
        };
        reader.readAsArrayBuffer(props.file);
      })();

      if (typeof _ret === 'object') return _ret.v;
    } else if (!!props.content) {
      var bytes = window.atob(props.content);
      var byteLength = bytes.length;
      var byteArray = new Uint8Array(new ArrayBuffer(byteLength));
      for (var index = 0; index < byteLength; index++) {
        byteArray[index] = bytes.charCodeAt(index);
      }
      this.loadByteArray(byteArray);
    } else {
      throw new Error('React-PDFjs works with a file(URL) or (base64)content. At least one needs to be provided!');
    }
  };

  Pdf.prototype.renderPdf = function renderPdf() {
    var page = this.state.page;

    if (page) {
      var canvas = this.refs.canvas;

      if (canvas.getDOMNode) {
        // compatible with react 0.13
        canvas = canvas.getDOMNode();
      }
      var canvasContext = canvas.getContext('2d');
      var scale = this.props.scale;

      var viewport = page.getViewport(scale);
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page.render({ canvasContext: canvasContext, viewport: viewport });
    }
  };

  Pdf.prototype.render = function render() {
    var loading = this.props.loading;
    var page = this.state.page;

    return page ? _react2['default'].createElement('canvas', { ref: 'canvas' }) : loading || _react2['default'].createElement(
      'div',
      null,
      'Loading PDF...'
    );
  };

  return Pdf;
})(_react.Component);

Pdf.displayName = 'React-PDFjs';
Pdf.propTypes = {
  content: _react.PropTypes.string,
  file: _react.PropTypes.string,
  loading: _react.PropTypes.any,
  page: _react.PropTypes.number,
  scale: _react.PropTypes.number,
  onDocumentComplete: _react.PropTypes.func,
  onPageComplete: _react.PropTypes.func
};
Pdf.defaultProps = { page: 1, scale: 1.0 };

exports['default'] = Pdf;
module.exports = exports['default'];