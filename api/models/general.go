package models

type GenericId uint

type IDer interface {
	ID() uint
}

func (g GenericId) ID() uint {
	return uint(g)
}

func FilterDuplicates[T IDer](items []T) []T {
	seen := make(map[uint]bool)
	var result []T
	
	for _, item := range items {
		if !seen[item.ID()] {
			seen[item.ID()] = true
			result = append(result, item)
		}
	}

	return result
}
