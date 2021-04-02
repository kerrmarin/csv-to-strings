import CSVParser from 'csv-parser'
import { Readable } from 'stream'
import stripBom from 'strip-bom'

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
    this.csvData = stripBom(csvData)

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
      .pipe(CSVParser())
      .on('data', (data) => this.parse(data))
      .on('end', () => this.outputFile(callback))
  }

  private parse(data: any): void {
    const { Key, Comment, ...translations } = data

    const trans: Translation[] = Object.entries(translations)
      .filter(([key, value]) => {
        const translation = value as string
        return translation.length != 0
      })
      .map(([key, value]) => {
        return { languageCode: key.toLowerCase(), translation: value as string }
      })
    this.entries.push({ key: Key, comment: Comment, translations: trans })
  }

  private outputFile(
    callback: (output: StringsFile[], format: string) => void
  ): void {
    const orderedEntries = this.entries
    orderedEntries.sort((a, b) => {
      if (a.key < b.key) {
        return -1
      }
      if (a.key > b.key) {
        return 1
      }
      return 0
    })
    callback(this.compiler.compile(orderedEntries), this.compiler.outputFormat)
  }
}
