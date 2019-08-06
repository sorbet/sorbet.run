# typed: true
sig(a: Integer, b: Integer).returns(Integer)
def foo(a, b)
  while b != 0
    if a > b
      a -= b
    else
      b -= a
    end
  end
  return a
end
