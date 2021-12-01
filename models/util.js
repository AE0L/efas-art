const random_id = (pref) => {
    return `${pref}-${Math.floor(100000 + Math.random() * 900000)}`
}

export default random_id