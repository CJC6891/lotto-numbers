const DEFAULT_NUMBERS_OPTIONS = {
  count: false,
  sortDir: false,
  sortKey: 'cnt'
}
const DEFAULT_PRIZES_OPTIONS = {
  count: false,
  groupBy: '',
  sortDir: false,
  sortKey: '7 oikein'
}

/**
 * Get MAX and MIN lottery numbers
 * @method getNumbers
 * @param  {Array}    [items=[]]
 * @param  {Object}   [options=DEFAULT_NUMBERS_OPTIONS]
 * @return {Array}
 */
export const getNumbers = (
  items = [],
  options = DEFAULT_NUMBERS_OPTIONS
) => {
  if (!items.length) return null

  const {
    count,
    sortDir,
    sortKey
  } = options
  const numbers = []
  const onSort = sortByKey(sortDir, sortKey)
  const onSlice = count ? [0, count] : false

  items.forEach(item => {
    item.primary.forEach(num => {
      const itemIndex = numbers.findIndex(item => item.number === num)

      if (itemIndex === -1) {
        numbers.push({
          number: num,
          count: 1
        })
      } else {
        numbers[itemIndex] = {
          number: num,
          count: numbers[itemIndex].count + 1
        }
      }
    })
  })

  return numbers.sort(onSort).slice(...onSlice)
}

/**
 * Get MAX and MIN prizes won
 * @method getPrizes
 * @param  {Array}   [items=[]]
 * @param  {Object}  [options=DEFAULT_PRIZES_OPTIONS]
 * @return {Array}
 */
export const getPrizes = (
  items = [],
  options = DEFAULT_PRIZES_OPTIONS
) => {
  if (!items.length) return null

  const {
    count,
    sortDir,
    sortKey
  } = options
  const getMax = (arr) => getMaxInArray(arr.prizes, 'share')
  const onSort = {
    asc: (a, b) => getMax(a) - getMax(b),
    desc: (a, b) => getMax(b) - getMax(a)
  }
  const onSlice = count ? [0, count] : false

  return items
    .filter(item => getMaxInArray(
      item.prizes.filter(i => i.name === sortKey),
      'share'
    ) !== 0)
    .sort(onSort[sortDir])
    .slice(...onSlice)
}

/**
 * Get MAX key value of an object in an array
 * @method getMaxInArray
 * @param  {Array}       [arr=[]]
 * @param  {String}      [key='']
 * @return {Number}
 */
export const getMaxInArray = (
  arr = [],
  key = ''
) => {
  if (!arr || !key) console.log('arr and key are required')

  return (
    Math.max.apply(
      Math,
      arr.map(a => a[key])
    )
  )
}

/**
 * Sort array of objects by key
 * @method sortByKey
 * @param  {String}   sortDir
 * @param  {String}   sortKey
 * @return {Function}
 */
export const sortByKey = (
  sortDir,
  sortKey
) => {
  const compareByType = (x, y) => {
    if (typeof x === 'string') return x > y

    return x - y
  }

  return sortDir === 'desc'
    ? (a, b) => compareByType(b[sortKey], a[sortKey])
    : sortDir === 'asc'
      ? (a, b) => compareByType(a[sortKey], b[sortKey])
      : false
}

/**
 * Parse prizes by date
 * @method parsePrizes
 * @param  {Array}     prizes
 * @param  {String}    date
 * @return {Object}
 */
export const parsePrizes = (
  prizes,
  date
) => {
  return prizes.map(prize => {
    const primary = prize.name.charAt(0)
    const secondary = prize.name.charAt(1) === '+' ? prize.name.charAt(2) : 0

    return {
      name: prize.name,
      date: date,
      share: prize.share,
      values: {
        primary: parseInt(primary, 10),
        secondary: parseInt(secondary, 10)
      }
    }
  })
}

/**
 * Get sorted prizes
 * @method getSortedPrizes
 * @param  {Array}         items
 * @param  {Object}        options
 * @return {Array}
 */
export const getSortedPrizes = (
  items,
  options
) => {
  const prizes = getPrizes(items, options)
  const prizesByYear = []

  prizes.forEach((item) => {
    const year = new Date(item.date).getFullYear()
    const amount = getMaxInArray(
      item.prizes.filter(i => i.name === options.sortKey),
      'share'
    )

    if (prizesByYear.some(arrItem => arrItem.year === year)) {
      prizesByYear.find(arrItem => arrItem.year === year).yearTotal += amount
    } else {
      prizesByYear.push({
        year: year,
        yearTotal: amount
      })
    }
  })

  return prizesByYear.sort(sortByKey('asc', 'year'))
}

/**
 * Get date range of items
 * @method getDateRange
 * @param  {Array}     items
 * @return {Object}
 */
export const getDateRange = (items) => {
  const range = {
    min: 0,
    max: 0
  }

  items.forEach(item => {
    const date = item.date

    range.min = (!range.min || date < range.min)
      ? date
      : range.min
    range.max = (!range.max || date > range.max)
      ? date
      : range.max
  })

  return range
}
