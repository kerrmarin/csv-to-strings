import Entry from './Entry'
import StringsFile from './StringsFile'

export default interface Compiler {
  outputFormat: string
  compile(categories: Entry[]): StringsFile[]
}
