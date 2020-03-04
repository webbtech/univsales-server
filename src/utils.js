import fetch from 'node-fetch'

export async function savePDF(args, cfg, token) {
  const url = cfg.PDFSaveURI
  try {
    const ret = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    if (ret.status !== 201) {
      return new Error(`Save quote PDF failed - ${ret.status} error with message: ${ret.statusText}`)
    }
  } catch (e) {
    throw new Error(e)
  }
  return true
}

export async function saveWrkShtPDF(args, cfg, token) {
  const url = cfg.PDFWrkShtSaveURI
  try {
    const ret = await fetch(url, {
      method: 'post',
      body: JSON.stringify(args),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    if (ret.status !== 201) {
      return new Error(`Save Worksheet PDF failed - ${ret.status} error with message: ${ret.statusText}`)
    }
  } catch (e) {
    throw new Error(e)
  }
  return true
}

export function phoneRegex(phone) {
  if (phone.length < 3) return false

  const regex = /\(?(\d{3})\)?\s?(\d{3})?-?(\d{4})?/
  const res = phone.match(regex)
  let retPhone = ''

  if (res[3] !== undefined) {
    retPhone = `^\\(${res[1]}\\) ${res[2]}-${res[3]}$`
  } else if (res[2] !== undefined) {
    retPhone = `^\\(${res[1]}\\) ${res[2]}`
  } else if (res[1] !== undefined) {
    retPhone = `^\\(${res[1]}\\)`
  }
  return retPhone
}

export function fmtPostalCode(code) {
  const postalCode = code.trim()
  if (postalCode.length < 6) return postalCode
  const validPat = /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ] ?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i
  const valid = validPat.test(postalCode)
  if (!valid) return ''

  // add space if missing
  if (postalCode.length === 6) {
    const re = /(.{3})(.{3})/
    return postalCode.replace(re, '$1 $2')
  }

  return postalCode
}
