import path from 'path'

export default (f) => {
    return path.join(__basedir, 'public', f)
}