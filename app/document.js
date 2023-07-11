"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfDocumentServices = void 0;
var path = require("path");
var PdfPrinter = require('pdfmake');
var fs = require('fs');
var exec = require('child_process').exec;
var PdfDocumentServices = /** @class */ (function () {
    function PdfDocumentServices(storage, documentStoragePath) {
        this.storage = storage;
        this.documentStoragePath = documentStoragePath;
    }
    PdfDocumentServices.prototype.generateGroupByPartner = function (rows) {
        var map = {};
        if (rows) {
            for (var i = 0; i < rows.length; ++i) {
                if (!map[rows[i].partner_id]) {
                    map[rows[i].partner_id] = [];
                }
                map[rows[i].partner_id].push(rows[i]);
            }
        }
        return map;
    };
    PdfDocumentServices.prototype.generateLoad = function (id) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.storage.reportHistoryByGroup(id).then(function (rows) {
                var groups = self.generateGroupByPartner(rows);
                if (groups) {
                    var _loop_1 = function (key) {
                        var pdf_filepath = path.join(self.documentStoragePath, '' + id + '_' + key + '.pdf');
                        var printer = new PdfPrinter({
                            Roboto: {
                                normal: 'fonts/Roboto-Regular.ttf',
                                bold: 'fonts/Roboto-Medium.ttf',
                                italics: 'fonts/Roboto-Italic.ttf',
                                bolditalics: 'fonts/Roboto-MediumItalic.ttf'
                            }
                        });
                        var pdfDoc = printer.createPdfKitDocument(self.getDocumentDescription(groups[key]));
                        pdfDoc.pipe(fs.createWriteStream(pdf_filepath));
                        pdfDoc.on('end', function () {
                            exec('start ' + pdf_filepath);
                        });
                        pdfDoc.end();
                    };
                    for (var key in groups) {
                        _loop_1(key);
                    }
                }
                resolve();
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    PdfDocumentServices.prototype.getDateString = function (d) {
        var date = new Date(d);
        return '' + date.getFullYear() + ' - ' + (date.getMonth() + 1).toString().padStart(2, '0') + ' - ' + date.getDate().toString().padStart(2, '0');
    };
    PdfDocumentServices.prototype.getDocumentDescription = function (rows) {
        var header_body = {
            partner: '',
            date: '',
        };
        var table_body = [
            [
                {
                    text: 'Árú Megnevezés',
                    style: 'itemsHeader'
                },
                {
                    text: 'Helység',
                    style: ['itemsHeader', 'center']
                },
                {
                    text: 'Raklap',
                    style: ['itemsHeader', 'center']
                },
                {
                    text: 'Mennyiség',
                    style: ['itemsHeader', 'center']
                },
                {
                    text: 'Göngyöleg',
                    style: ['itemsHeader', 'center']
                }
            ]
        ];
        if (rows) {
            //TODO: partnerenkénti bontás
            if (rows.length > 0) {
                header_body.partner = rows[0].partner_name;
                header_body.date = this.getDateString(rows[0].created);
            }
            for (var i = 0; i < rows.length; ++i) {
                table_body.push([
                    {
                        text: rows[i].item_name,
                        style: 'itemText'
                    },
                    {
                        text: rows[i].location_name,
                        style: 'itemText'
                    },
                    {
                        text: rows[i].pallets.toString(),
                        style: 'itemNumber'
                    },
                    {
                        text: rows[i].quantity.toString(),
                        style: 'itemNumber'
                    },
                    {
                        text: rows[i].empties.toString(),
                        style: 'itemNumber'
                    }
                ]);
            }
        }
        var table_definition = {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: table_body
        };
        return {
            header: {
                stack: [
                    { text: "Transport Services Kft.", style: 'documentHeaderLeft' },
                    { text: "https://example-transport.com/", style: 'documentHeaderLeft2' }
                ]
            },
            footer: function (currentPage, pageCount) {
                return {
                    columns: [{ text: "" + currentPage.toString() + ' / ' + pageCount, style: 'documentFooterCenter' }]
                };
            },
            content: [
                // Header
                {
                    stack: [
                        {
                            text: 'Betárazás',
                            style: 'invoiceTitle'
                        },
                        {
                            columns: [
                                {
                                    text: 'Dátum:',
                                    style: 'invoiceSubTitle',
                                    width: '20%'
                                },
                                {
                                    text: header_body.date,
                                    style: 'invoiceSubValue'
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    text: 'Partner részére:',
                                    style: 'invoiceSubTitle',
                                    width: '20%'
                                },
                                {
                                    text: header_body.partner,
                                    style: 'invoiceSubValue',
                                }
                            ]
                        }
                    ]
                },
                // Line breaks
                '\n\n',
                // Items
                {
                    table: table_definition,
                },
                // Signature
                {
                    columns: [
                        {
                            text: '',
                        },
                        {
                            stack: [
                                {
                                    text: '_________________________________',
                                    style: 'signaturePlaceholder'
                                },
                                {
                                    text: 'Aláírás',
                                    style: 'signatureName'
                                }
                            ],
                            width: 180
                        },
                    ]
                }
            ],
            styles: {
                // Document Header
                documentHeaderLeft: {
                    fontSize: 8,
                    margin: [5, 5, 5, 0],
                    alignment: 'left'
                },
                documentHeaderLeft2: {
                    fontSize: 8,
                    margin: [5, 0, 5, 5],
                    alignment: 'left'
                },
                documentHeaderCenter: {
                    fontSize: 8,
                    margin: [5, 5, 5, 5],
                    alignment: 'center'
                },
                documentHeaderRight: {
                    fontSize: 8,
                    margin: [5, 5, 5, 5],
                    alignment: 'right'
                },
                // Document Footer
                documentFooterLeft: {
                    fontSize: 8,
                    margin: [5, 5, 5, 5],
                    alignment: 'left'
                },
                documentFooterCenter: {
                    fontSize: 8,
                    margin: [5, 5, 5, 5],
                    alignment: 'center'
                },
                documentFooterRight: {
                    fontSize: 8,
                    margin: [5, 5, 5, 5],
                    alignment: 'right'
                },
                // Invoice Title
                invoiceTitle: {
                    fontSize: 22,
                    bold: true,
                    alignment: 'left',
                    margin: [0, 0, 0, 15]
                },
                // Invoice Details
                invoiceSubTitle: {
                    fontSize: 12,
                    alignment: 'left'
                },
                invoiceSubValue: {
                    fontSize: 12,
                    alignment: 'left'
                },
                // Billing Headers
                invoiceBillingTitle: {
                    fontSize: 14,
                    bold: true,
                    alignment: 'left',
                    margin: [0, 20, 0, 5],
                },
                itemsHeader: {
                    margin: [0, 5, 0, 5],
                    bold: true
                },
                itemText: {
                    margin: [0, 5, 0, 5]
                },
                itemNumber: {
                    margin: [0, 5, 0, 5],
                    alignment: 'center',
                },
                signaturePlaceholder: {
                    margin: [0, 70, 0, 0],
                },
                signatureName: {
                    bold: true,
                    alignment: 'center',
                },
                center: {
                    alignment: 'center',
                },
            },
            defaultStyle: {
                columnGap: 20,
            }
        };
    };
    return PdfDocumentServices;
}());
exports.PdfDocumentServices = PdfDocumentServices;
;
//# sourceMappingURL=document.js.map