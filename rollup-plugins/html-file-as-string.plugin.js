import {createFilter} from 'rollup-pluginutils';

const defaultInclude = '**/*.html';

export default function htmlFileAsString(opts = {}) {
    const filter = createFilter(opts.include ?? defaultInclude, opts.exclude)
    return {
        name: 'html-file-as-string',
        order: 'pre',
        transform(code, id) {
            if (filter(id)) {
                return `export default ${JSON.stringify(code)};`
            }
        }
    }
}