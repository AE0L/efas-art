import path from 'path'

export default function(f) {
    return path.join(__basedir, 'public', f)
}