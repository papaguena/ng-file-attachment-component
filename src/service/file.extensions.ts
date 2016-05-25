/**
 * Extends the File native type with a new method 'getFileExtension'
 */
interface File {
    getFileExtension(): string;
}

//TODO MGA: very important to not use delegate here, otherwise this is badly captured. it MUST be an anonymous function.
File.prototype.getFileExtension = function () {
    return this.name.substr(this.name.lastIndexOf('.') + 1);
}
