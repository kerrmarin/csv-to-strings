import CSVParser from 'csv-parser'
import { Readable } from 'stream'

import Entry from '../models/Entry'
import Translation from '../models/Translation'

import Compiler from '../models/Compiler'
import IOSCompiler from '../compilers/IOSCompiler'

import InvalidPlatformError from '../errors/InvalidPlatformError'
import StringsFile from '../models/StringsFile'

export default class CSVToStrings {
  private entries: Entry[] = []
  private csvData: string
  private compiler: Compiler

  constructor(platform: string, csvData: string) {
    this.csvData = csvData

    switch (platform) {
      case 'ios':
        this.compiler = new IOSCompiler()
        break

      default:
        throw new InvalidPlatformError()
    }
  }

  public exec(callback: (output: StringsFile[], format: string) => void): void {
    Readable.from(this.csvData)
      .pipe(CSVParser({ skipLines: 1 }))
      .on('data', (data) => this.parse(data))
      .on('end', () => this.outputFile(callback))
  }

  private parse(data: any): void {
    const { Key, Comment, ...translations } = data

    const trans: Translation[] = Object.entries(translations).map(
      ([key, value]) => {
        return { languageCode: key.toLowerCase(), translation: value as string }
      }
    )
    this.entries.push({ key: Key, comment: Comment, translations: trans })
  }

  private outputFile(
    callback: (output: StringsFile[], format: string) => void
  ): void {
    callback(this.compiler.compile(this.entries), this.compiler.outputFormat)
  }
}
