<?php

namespace App\Dto;

final class SearchCriteria
{
    public function __construct(
        public readonly string $q = '',
        public readonly array  $categories = [],
        public readonly ?float $priceMin = null,
        public readonly ?float $priceMax = null,
        public readonly bool   $onlyAvailable = false,
        public readonly string $sort = 'relevance',
        public readonly string $type = 'all',
    ) {}
}
