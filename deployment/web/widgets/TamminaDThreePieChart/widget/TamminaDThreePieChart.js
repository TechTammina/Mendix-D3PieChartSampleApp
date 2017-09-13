define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "TamminaDThreePieChart/lib/jquery-1.11.2",
    "dojo/text!TamminaDThreePieChart/widget/template/TamminaDThreePieChart.html",
    "TamminaDThreePieChart/lib/d3.v3",
    "TamminaDThreePieChart/lib/d3pie"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry,
    dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent,
    _jQuery, widgetTemplate, d3, d3pie) {
        "use strict";

        var $ = _jQuery.noConflict(true);

        return declare("TamminaDThreePieChart.widget.TamminaDThreePieChart", [_WidgetBase, _TemplatedMixin], {

            templateString: widgetTemplate,
            widgetBase: null,
            pieChart: null,
            // Internal variables.
            _handles: null,
            _contextObj: null,
            _chart: null,
            _previousId: '',


            constructor: function () {
                this._handles = [];
            },

            postCreate: function () {
                this.pieChart.id += "_" + this.domNode.id.slice(-1);
                logger.debug(this.id + ".postCreate");
            },

            update: function (obj, callback) {
                logger.debug(this.id + ".update");
                this._contextObj = obj;
                this._resetSubscriptions(obj);
                this._updateRendering(obj, callback);
            },

            resize: function (box) {
                logger.debug(this.id + ".resize");
                this._previousId = this.id;
            },

            uninitialize: function () {
                this._clearNode(this.pieChart, this._updateRendering(this._contextObj));
            },

            _clearNode: function (node, callback) {
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                    if (typeof callback !== "undefined") {
                        callback();
                    }
                }


            },
            _resetSubscriptions: function () {
                logger.debug(this.id + "._resetSubscriptions");
                var _objectHandle = null;

                // Release handles on previous object, if any.
                if (this._handles) {
                    dojoArray.forEach(this._handles, function (handle, i) {
                        mx.data.unsubscribe(handle);
                    });
                    this._handles = [];
                }

                // When a mendix object exists create subscribtions.
                if (this._contextObj) {
                    _objectHandle = this.subscribe({
                        guid: this._contextObj.getGuid(),
                        callback: lang.hitch(this, function (guid) {
                            this._clearNode(this.pieChart, this._updateRendering(this._contextObj));
                        })
                    });


                    this._handles = [_objectHandle];
                }

            },

            _updateRendering: function (obj, callback) {

                this._contextObj = obj;
                logger.debug(this.id + "._updateRendering d3pie");
                if (this._contextObj !== null) {
                    dojoStyle.set(this.domNode, "display", "block");
                    this._createChart();
                } else {
                    dojoStyle.set(this.domNode, "display", "none");
                }
                this._executeCallback(callback, "_updateRendering");
            },

            _createChart: function () {
                try {
                    var dataGen = {}, labelTruncation = {}, labelLines = {},
                        innerLabel = {}, titleFont = "", subtitleFont = "",
                        titlelocation = "", customHeader = {}, chartSize = {}, colorScale, footerLoc = "";

                    switch (this.titleFontStyle) {
                        case "lusidasans":
                            titleFont = "lusida sans";
                            break;
                        case "timesnewroman":
                            titleFont = "times new roman";
                            break;
                        case "opensans":
                            titleFont = "open sans";
                            break;
                        default:
                            titleFont = this.titleFontStyle;
                    };

                    switch (this.subTitleFontStyle) {
                        case "lusidasans":
                            subtitleFont = "lusida sans";
                            break;
                        case "timesnewroman":
                            subtitleFont = "times new roman";
                            break;
                        case "opensans":
                            subtitleFont = "open sans";
                            break;
                        default:
                            subtitleFont = this.subTitleFontStyle;
                    };

                    switch (this.titleLocation) {
                        case "topLeft":
                            titlelocation = "top-left";
                            break;
                        case "topCenter":
                            titlelocation = "top-center";
                            break;
                        case "pieCenter":
                            titlelocation = "pie-center";
                            break;
                        default:
                            titlelocation = "top-left";
                    };

                    customHeader = {
                        "title": {
                            "text": this.title,
                            "color": this.titleColor,
                            "fontSize": this.titleFontSize,
                            "font": titleFont
                        },
                        "subtitle": {
                            "text": this.subTitle,
                            "color": this.subTitleColor,
                            "fontSize": this.subTitleFontSize,
                            "font": subtitleFont
                        },
                        "location": titlelocation,
                        "titleSubtitlePadding": this.titleSubtitlePadding
                    };

                    chartSize = {
                        "canvasWidth": this.canvasWidth,
                        "canvasHeight": this.canvasHeight,
                        "pieInnerRadius": this.pieInnerRadius + '%',
                        "pieOuterRadius": this.pieOuterRadius + '%'
                    }

                    switch (this.pieColor) {
                        case "colorScale10":
                            colorScale = d3.scale.category10();
                            break;
                        case "colorScale20":
                            colorScale = d3.scale.category20();
                            break;
                        case "colorScale20b":
                            colorScale = d3.scale.category20b();
                            break;
                        case "colorScale20c":
                            colorScale = d3.scale.category20c();
                            break;
                        default:
                            colorGen = d3.scale.category20c();
                    };
                    var pieLabel = this._contextObj.get(this.text).split("~");//['JavaScript', 'Ruby', 'Java', 'PHP', 'Python'];
                    var pieValue = this._contextObj.get(this.value).split("~");//[264131, 218812, 157618, 114384, 95002];
                    var pieContent = [], sortOrd = "";
                    var outerLabelFormat = "";
                    switch (this.outerLabelContent) {
                        case "labelValue1":
                            outerLabelFormat = "label-value1";
                            break;
                        case "labelValue2":
                            outerLabelFormat = "label-value2"
                            break;
                        case "labelPercentage1":
                            outerLabelFormat = "label-percentage1";
                            break;
                        case "labelPercentage2":
                            outerLabelFormat = "label-percentage2";
                            break;
                        default:
                            outerLabelFormat = this.outerLabelContent;
                    };

                    for (var i = 0; i < pieValue.length; i++) {


                        var obj = {
                            "label": pieLabel[i],
                            "value": parseInt(pieValue[i]),
                            "color": colorScale(i)
                        }
                        pieContent.push(obj);
                    }

                    switch (this.sortOrder) {
                        case "valAsc":
                            sortOrd = "value-asc";
                            break;
                        case "valDesc":
                            sortOrd = "value-desc";
                            break;
                        case "labelAsc":
                            sortOrd = "label-asc";
                            break;
                        case "labelDesc":
                            sortOrd = "label-desc";
                            break;
                        default:
                            sortOrd = this.sortOrder;
                    };

                    dataGen = {
                        "sortOrder": sortOrd,
                        "content": pieContent
                    }



                    if (this.enableSmallSegGroup == "enable") {
                        dataGen["smallSegmentGrouping"] = {
                            "enabled": true,
                            "valueType": this.groupSegWith,
                            "value": this.segVal,
                            "color": this.segmentColor,
                            "label": this.groupLabel,
                        }
                    }

                    if (this.hideInnerContent == "never") {
                        innerLabel = {
                            "format": this.innerLabelContent
                        }

                    } else {
                        innerLabel = {
                            "format": this.innerLabelContent,
                            "hideWhenLessThanPercentage": this.hideInnerContentValue
                        }
                    }

                    if (this.truncateLongLabel = "enabled") {
                        labelTruncation = {
                            "enabled": true,
                            "truncateLength": this.truncateLabelLength
                        }
                    } else {
                        labelTruncation = {
                            "enabled": false
                        }
                    }

                    if (this.enableLines == "enable") {
                        if (this.lineColorSegment == "segment") {
                            labelLines = {
                                "enabled": true,
                                "style": this.lineStyle
                            }
                        } else {
                            labelLines = {
                                "enabled": true,
                                "style": this.lineStyle,
                                "color": this.lineColor
                            }

                        }

                    } else {
                        labelLines = {
                            "enabled": false
                        }
                    }

                    var finalPieObj = {};
                    finalPieObj["header"] = customHeader;

                    switch (this.footerLocation) {
                        case "bottomLeft":
                            footerLoc = "bottom-left";
                            break;
                        case "bottomCenter":
                            footerLoc = "bottom-center"
                            break;
                        case "bottomRight":
                            footerLoc = "bottom-right";
                            break;
                        default:
                            footerLoc = "bottom-left";
                    };

                    finalPieObj["footer"] = {
                        "text": this.footerText,
                        "color": this.footerColor,
                        "fontSize": this.footerFontSize,
                        "font": this.footerFontStyle,
                        "location": footerLoc
                    }
                    finalPieObj["size"] = chartSize;
                    finalPieObj["data"] = dataGen;
                    finalPieObj["labels"] = {
                        "outer": {
                            "format": outerLabelFormat,
                            "pieDistance": this.distanceFromPie
                        },
                        "inner": innerLabel,
                        "mainLabel": {
                            "color": this.labelColor,
                            "font": this.labelFontStyle,
                            "fontSize": this.labelFontSize
                        },
                        "percentage": {
                            "color": this.percentageColor,
                            "font": this.percentageFontStyle,
                            "fontSize": this.percentageFontSize,
                            "decimalPlaces": this.decimalPlacePercent
                        },
                        "value": {
                            "color": this.valueColor,
                            "font": this.valueFontStyle,
                            "fontSize": this.valueFontSize
                        },
                        "lines": labelLines,
                        "truncation": labelTruncation
                    };

                    if (this.tooltipsEnable == "enable") {
                        finalPieObj["tooltips"] = {
                            "enabled": true,
                            "type": "placeholder",
                            "string": this.tooltipFormat,
                            "styles": {
                                "color": this.tooltipColor,
                                "font": this.tooltipFontStyle,
                                "fontSize": this.tooltipFontSize,
                                "backgroundColor": this.tooltipBgColor,
                                "fadeInSpeed": this.fadeInSpeed,
                                "backgroundOpacity": parseFloat(this.bgOpacity),
                                "padding": this.tooltipPadding
                            }
                        }
                    }

                    var highlightPieVal = false;
                    if (this.highlightPie == "no") {
                        highlightPieVal = false;
                    } else {
                        highlightPieVal = true;
                    }
                    finalPieObj["effects"] = {
                        load: {
                            effect: this.loadEffect,
                            speed: this.loadSpeed
                        },
                        pullOutSegmentOnClick: {
                            effect: this.pieClickEffect,
                            speed: this.pieClickSpeed,
                            size: this.piePullOut
                        },
                        highlightSegmentOnMouseover: highlightPieVal,
                        highlightLuminosity: parseFloat(this.highlightLuminosity)
                    }

                    var gradEnab = false;
                    if (this.segmentGradEnable == "enable") {
                        gradEnab = true;
                    }

                    var miscBg = null;
                    if (this.background == "null") {
                        miscBg = null;
                    } else {
                        miscBg = this.backgroundColor;
                    }
                    finalPieObj["misc"] = {
                        "colors": {
                            "background": miscBg,
                            "segmentStroke": this.strokeColor
                        },
                        "gradient": {
                            "enabled": gradEnab,
                            "percentage": this.gradientPercent,
                            "color": this.enabledGradColor
                        },
                        "canvasPadding": {
                            "top": this.canvasPaddingTop,
                            "right": this.canvasPaddingRight,
                            "bottom": this.canvasPaddingBottom,
                            "left": this.canvasPaddingLeft
                        },
                        "pieCenterOffset": {
                            "x": this.xOffset,
                            "y": this.yOffset
                        }
                    }
                    //console.log("Final pie chart=>" + JSON.stringify(finalPieObj));

                    this._chart = new d3pie(this.pieChart.id, finalPieObj);

                } catch (e) {
                    alert("error:" + e.message);
                }

            },

            // Shorthand for running a microflow
            _execMf: function (mf, guid, cb) {
                logger.debug(this.id + "._execMf");
                if (mf && guid) {
                    mx.ui.action(mf, {
                        params: {
                            applyto: "selection",
                            guids: [guid]
                        },
                        callback: lang.hitch(this, function (objs) {
                            if (cb && typeof cb === "function") {
                                cb(objs);
                            }
                        }),
                        error: function (error) {
                            console.debug(error.description);
                        }
                    }, this);
                }
            },

            // Shorthand for executing a callback, adds logging to your inspector
            _executeCallback: function (cb, from) {
                logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
                if (cb && typeof cb === "function") {
                    cb();
                }
            }
        });
    });

require(["TamminaDThreePieChart/widget/TamminaDThreePieChart"]);
