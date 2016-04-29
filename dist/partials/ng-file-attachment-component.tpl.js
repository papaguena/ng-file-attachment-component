(function(module) {
try {
  module = angular.module('file-attachment-component-tpl');
} catch (e) {
  module = angular.module('file-attachment-component-tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('component/file-attachment.tpl.html',
    '<div id="file-attachment-container" class="container-fuild" cg-busy="vm.httpPromises"><div class="row"><div class="col-lg-12"><table st-table="vm.attachedFileList" st-safe-src="vm.attachedFileListSource" class="table table-bordered table-hover"><thead><tr><th class="t-header">FileName</th><th class="t-header">Origin</th><th class="t-header">Uploaded By</th><th class="t-header">Creation Date</th><th class="t-header">Comment</th><th class="t-header">Actions</th></tr></thead><tbody><tr ng-repeat="attachedFileEntry in vm.attachedFileList"><td>{{ attachedFileEntry.FileName }}</td><td>{{ attachedFileEntry.Origin }}</td><td>{{ attachedFileEntry.UploadedBy }}</td><td>{{ attachedFileEntry.CreationDate }}</td><td>{{ attachedFileEntry.Comment }}</td><td><button type="button" ng-click="vm.downloadAttachedFile(attachedFileEntry)" class="btn btn-sm"><i class="fa fa-download" aria-hidden="true"></i></button> <a id="{{ vm.fileAttachmentDownloadLinkElementId }}" class="ng-hide" target="_self"></a> <button type="button" ng-click="vm.deleteAttachedFile(attachedFileEntry)" class="btn btn-sm"><i class="fa fa-trash" aria-hidden="true"></i></button></td></tr></tbody><tfoot ng-show="vm.atttachedFileList && (vm.attachedFileList.length > vm.nbOfItemsPerPage)"><tr><td colspan="6" class="text-center"><div st-pagination st-template="templates/smart-table/smart-table-pagination.tpl.html" st-items-by-page="vm.nbOfItemsPerPage" st-displayed-pages="7"></div></td></tr></tfoot></table></div></div><div class="row"><div class="col-lg-12"><input ngf-select id="input-file-select-field" type="file" ng-model="vm.fileToUpload" ngf-change="vm.fileSelected($file, $event)" ngf-multiple="false"> <button id="select-bulk-file-btn" class="btn" type="button" ng-click="vm.openSelectFileDialog()" ng-disabled="vm.isSelectFileBtnDisabled()">Attach File</button></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('file-attachment-component-tpl');
} catch (e) {
  module = angular.module('file-attachment-component-tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/smart-table/smart-table-pagination.tpl.html',
    '<nav ng-if="pages.length >= 2"><ul class="pagination"><li ng-class="{ disabled : currentPage === 1}"><a ng-click="selectPage(1)"><i class="fa fa-angle-double-left"></i></a></li><li ng-class="{ disabled : currentPage === 1}"><a ng-click="selectPage(currentPage-1)"><i class="fa fa-angle-left"></i></a></li><li ng-repeat="page in pages" ng-class="{active: page==currentPage}"><a ng-click="selectPage(page)">{{ page }}</a></li><li ng-class="{ disabled : currentPage === numPages}"><a ng-click="selectPage(currentPage+1)"><i class="fa fa-angle-right"></i></a></li><li ng-class="{ disabled : currentPage === numPages}"><a ng-click="selectPage(numPages)"><i class="fa fa-angle-double-right"></i></a></li></ul></nav>');
}]);
})();

(function(module) {
try {
  module = angular.module('file-attachment-component-tpl');
} catch (e) {
  module = angular.module('file-attachment-component-tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/angular-busy/angular-busy-custom.tpl.html',
    '<div class="cg-busy-default-wrapper"><div class="cg-busy-position"><div class="cg-busy-default-spinner"><div class="bar1"></div><div class="bar2"></div><div class="bar3"></div><div class="bar4"></div><div class="bar5"></div><div class="bar6"></div><div class="bar7"></div><div class="bar8"></div><div class="bar9"></div><div class="bar10"></div><div class="bar11"></div><div class="bar12"></div></div></div></div>');
}]);
})();