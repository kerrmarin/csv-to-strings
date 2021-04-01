import Entry from '../models/Entry'
import Compiler from '../models/Compiler'
import StringsFile from '../models/StringsFile'

export default class IOSCompiler implements Compiler {
  outputFormat = 'strings'
  private stringFiles: Map<string, StringsFile> = new Map()

  compile(entries: Entry[]): StringsFile[] {
    for (const entry of entries) {
      for (const translation of entry.translations) {
        if (!this.stringFiles.has(translation.languageCode)) {
          this.stringFiles.set(translation.languageCode, {
            languageCode: translation.languageCode,
            contents: '',
          })
        }
        const file = this.stringFiles.get(
          translation.languageCode
        ) as StringsFile
        file.contents =
          file?.contents +
          `/* ${entry.comment} */\r\n` +
          `"${entry.key}" = "${translation.translation}";` +
          '\r\n\r\n'
      }
    }
    return Array.from(
      [...this.stringFiles].map((item) => {
        return item[1]
      })
    )
  }
}
